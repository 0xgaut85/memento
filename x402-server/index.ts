/**
 * Memento x402 Express Server
 * Payment gateway for Aggregator access
 * 
 * Exactly as per x402-solana README: https://github.com/PayAINetwork/x402-solana
 */

import { config } from 'dotenv';
import express from 'express';
import path from 'path';
import { X402PaymentHandler } from '@payai/x402-solana/server';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS!;
const serverPublicUrl = process.env.X402_PUBLIC_URL || 'https://x402.memento.money';
const mementoAppUrl = process.env.MEMENTO_APP_URL || 'https://app.memento.money';
// Solana RPC (use Helius to avoid public RPC rate limiting)
const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL ||
  'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

// USDC Mint addresses - exactly as per x402-solana README
const USDC_MINT_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDC_MINT_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

// Use mainnet by default
const USDC_MINT = process.env.NODE_ENV === 'development' ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
const NETWORK = process.env.NODE_ENV === 'development' ? 'solana-devnet' : 'solana';

// Price: $5 USDC = 5,000,000 micro-units (6 decimals)
const AGGREGATOR_PRICE = '5000000'; // $5 USDC
const AGGREGATOR_PRICE_USD = 5.00;

if (!treasuryAddress) {
  console.error('Missing required environment variable: TREASURY_WALLET_ADDRESS');
  process.exit(1);
}

const app = express();

// Trust proxy for Railway
app.set('trust proxy', true);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Memento x402 Server', timestamp: new Date().toISOString() });
});

// Debug config endpoint
app.get('/debug/config', (_req, res) => {
  let rpcHost = 'unknown';
  try {
    rpcHost = new URL(SOLANA_RPC_URL).host;
  } catch {
    rpcHost = 'invalid';
  }
  res.json({
    network: NETWORK,
    usdcMint: USDC_MINT,
    treasury: treasuryAddress,
    facilitator: 'https://facilitator.payai.network',
    rpcHost,
    nodeEnv: process.env.NODE_ENV,
    price: AGGREGATOR_PRICE,
  });
});

// CORS - allow all for x402 headers
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, PAYMENT-SIGNATURE, payment-signature');
  res.setHeader('Access-Control-Expose-Headers', 'PAYMENT-SIGNATURE, payment-signature');
  if (_req.method === 'OPTIONS') return res.status(204).end();
  next();
});

app.use(express.json());

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (_req, res) => res.redirect('/public/favicon.png'));
app.get('/favicon.png', (_req, res) => res.redirect('/public/favicon.png'));

// x402 Discovery endpoint
app.get('/.well-known/x402', (_req, res) => {
  res.json({
    version: '2.0',
    name: 'Memento Stablecoin Yield Aggregator',
    description: 'AI-curated stablecoin yield opportunities. Pay $5 USDC for 24hr access.',
    endpoints: [{
      path: '/aggregator/solana',
      method: 'POST',
      price: { amount: AGGREGATOR_PRICE, currency: 'USDC', decimals: 6, usd: AGGREGATOR_PRICE_USD },
      network: NETWORK,
    }],
    treasury: treasuryAddress,
    facilitator: 'https://facilitator.payai.network',
  });
});

// Landing page
app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!doctype html><html><head><title>Memento x402</title></head><body style="font-family:system-ui;padding:2rem;background:#111;color:#fff"><h1>Memento x402 Server</h1><p>$5 USDC for 24hr access</p><a href="/.well-known/x402" style="color:#0af">x402 Discovery</a></body></html>`);
});

// --- x402 Payment Handler ---
// EXACTLY as per https://github.com/PayAINetwork/x402-solana#server-side-express
const x402 = new X402PaymentHandler({
  network: NETWORK as 'solana' | 'solana-devnet',
  treasuryAddress: treasuryAddress,
  facilitatorUrl: 'https://facilitator.payai.network',
  rpcUrl: SOLANA_RPC_URL,
});

console.log('[x402] Server initialized');
console.log('[x402] Network:', NETWORK);
console.log('[x402] Treasury:', treasuryAddress);

// Helper functions
async function getOrCreateUser(address: string) {
  let user = await prisma.user.findUnique({ where: { address } });
  if (!user) user = await prisma.user.create({ data: { address } });
  return user;
}

async function hasActiveAccess(userId: string): Promise<boolean> {
  const access = await prisma.aggregatorAccess.findFirst({
    where: { userId, active: true, expiresAt: { gt: new Date() } },
  });
  return !!access;
}

async function grantAccess(userId: string, paymentId: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return prisma.aggregatorAccess.create({
    data: { userId, grantedAt: now, expiresAt, active: true, paymentId },
  });
}

// --- AGGREGATOR ENDPOINT ---
// EXACTLY as per https://github.com/PayAINetwork/x402-solana#server-side-express
app.post('/aggregator/solana', async (req, res) => {
  try {
    const { userAddress, accessType = 'human' } = req.body;
    const resourceUrl = `${serverPublicUrl}/aggregator/solana`;
    
    if (!userAddress) {
      return res.status(400).json({ error: 'Missing userAddress' });
    }
    
    // Check existing access
    if (accessType === 'human') {
      const user = await prisma.user.findUnique({ where: { address: userAddress } });
      if (user && await hasActiveAccess(user.id)) {
        const access = await prisma.aggregatorAccess.findFirst({
          where: { userId: user.id, active: true, expiresAt: { gt: new Date() } },
        });
        return res.json({
          success: true,
          accessGranted: true,
          alreadyHadAccess: true,
          expiresAt: access?.expiresAt?.toISOString(),
        });
      }
    }
    
    // 1. Extract payment header - EXACTLY as per README
    // Log ALL incoming headers to debug
    console.log('[x402] Incoming request headers:', Object.keys(req.headers));
    console.log('[x402] PAYMENT-SIGNATURE header:', req.headers['payment-signature'] ? `present (${String(req.headers['payment-signature']).length} chars)` : 'MISSING');
    console.log('[x402] payment-signature (lowercase):', req.headers['payment-signature'] ? 'present' : 'missing');
    
    let paymentHeader: string | undefined;
    try {
      paymentHeader = x402.extractPayment(req.headers);
      console.log('[x402] extractPayment result:', paymentHeader ? `found (${paymentHeader.length} chars)` : 'NOT FOUND');
    } catch (err) {
      console.error('[x402] extractPayment failed:', err);
      return res.status(500).json({ error: 'extractPayment failed', detail: String(err) });
    }
    
    // 2. Create payment requirements - EXACTLY as per README
    // https://github.com/PayAINetwork/x402-solana#routeconfig-format
    let paymentRequirements: Awaited<ReturnType<typeof x402.createPaymentRequirements>>;
    try {
      paymentRequirements = await x402.createPaymentRequirements(
        {
          amount: AGGREGATOR_PRICE, // "5000000" = $5 USDC
          asset: {
            address: USDC_MINT,
            decimals: 6,
          },
          description: 'Memento Aggregator - 24hr Access',
        },
        resourceUrl
      );
    } catch (err) {
      console.error('[x402] createPaymentRequirements failed:', err);
      return res.status(500).json({ error: 'createPaymentRequirements failed', detail: String(err) });
    }
    
    // 3. If no payment header, return 402 - EXACTLY as per README
    if (!paymentHeader) {
      console.log('[x402] No payment header found - returning 402');
      // README: create402Response(requirements, resourceUrl)
      // https://github.com/PayAINetwork/x402-solana
      let response402: ReturnType<typeof x402.create402Response>;
      try {
        response402 = x402.create402Response(paymentRequirements, resourceUrl);
      } catch (err) {
        console.error('[x402] create402Response failed:', err);
        return res.status(500).json({ error: 'create402Response failed', detail: String(err) });
      }
      return res.status(response402.status).json(response402.body);
    }
    
    console.log('[x402] Payment header found! Proceeding to verify...');
    
    // 4. Verify payment - EXACTLY as per README
    console.log('[x402] Got payment header, length:', paymentHeader.length);
    console.log('[x402] Payment header preview:', paymentHeader.substring(0, 100) + '...');
    
    let verified: Awaited<ReturnType<typeof x402.verifyPayment>>;
    try {
      verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
      console.log('[x402] Verify result:', JSON.stringify(verified));
    } catch (err) {
      console.error('[x402] verifyPayment threw:', err);
      return res.status(402).json({ 
        error: 'Payment verification failed', 
        reason: 'verify_exception',
        detail: String(err)
      });
    }
    
    if (!verified.isValid) {
      console.error('[x402] Verification failed:', verified.invalidReason);
      return res.status(402).json({ 
        error: 'Invalid payment', 
        reason: verified.invalidReason 
      });
    }
    
    // 5. Business logic
    const user = await getOrCreateUser(userAddress);
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: AGGREGATOR_PRICE,
        amountUsd: AGGREGATOR_PRICE_USD,
        currency: 'USDC',
        chain: 'solana',
        payerAddress: userAddress,
        service: 'aggregator',
        accessType,
        status: 'completed',
      },
    });
    
    // 6. Settle payment - EXACTLY as per README
    try {
      const settlement = await x402.settlePayment(paymentHeader, paymentRequirements);
      console.log('[x402] Settlement result:', JSON.stringify(settlement));
      if (!settlement.success) {
        console.error('[x402] Settlement failed:', settlement.errorReason);
      }
    } catch (err) {
      console.error('[x402] settlePayment threw:', err);
      // Don't fail the request - verification passed, just log the error
    }
    
    console.log('[x402] Payment successful for:', userAddress);
    
    // 7. Return response
    if (accessType === 'agent') {
      const pools = await fetchTopPools();
      return res.json({ success: true, accessGranted: true, pools, paymentId: payment.id });
    } else {
      const access = await grantAccess(user.id, payment.id);
      return res.json({
        success: true,
        accessGranted: true,
        expiresAt: access.expiresAt.toISOString(),
        message: 'Access granted for 24 hours!',
        paymentId: payment.id,
      });
    }
  } catch (error) {
    console.error('[Aggregator] Error:', error);
    const debugEnabled = req.headers['x-memento-debug'] === '1';
    const message = error instanceof Error ? error.message : 'Internal error';
    res.status(500).json(
      debugEnabled
        ? { error: message, name: error instanceof Error ? error.name : 'Unknown' }
        : { error: 'Internal server error' }
    );
  }
});

// Access check endpoint
app.get('/api/access/check', async (req, res) => {
  try {
    const userAddress = req.query.userAddress as string;
    if (!userAddress) return res.status(400).json({ error: 'Missing userAddress' });
    
    const user = await prisma.user.findUnique({ where: { address: userAddress } });
    if (!user) return res.json({ hasAccess: false });
    
    const access = await prisma.aggregatorAccess.findFirst({
      where: { userId: user.id, active: true, expiresAt: { gt: new Date() } },
    });
    
    if (!access) return res.json({ hasAccess: false });
    
    return res.json({
      hasAccess: true,
      expiresAt: access.expiresAt.toISOString(),
      remainingHours: Math.max(0, Math.round((access.expiresAt.getTime() - Date.now()) / 3600000 * 10) / 10),
    });
  } catch (error) {
    console.error('[Access] Error:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
});

// Fetch pools helper
async function fetchTopPools() {
  try {
    const response = await fetch('https://yields.llama.fi/pools');
    const data = await response.json();
    if (!data.data) return { safe: [], degen: [] };
    
    const pools = data.data;
    const safeSymbols = ['USDC', 'USDT', 'DAI', 'USDS'];
    const degenSymbols = ['USDE', 'SUSDE', 'FRAX', 'CRVUSD', 'GHO'];
    
    const safePools = pools
      .filter((p: any) => p.stablecoin && safeSymbols.some(s => p.symbol?.toUpperCase().includes(s)))
      .filter((p: any) => p.tvlUsd >= 25_000_000 && p.apy >= 2)
      .sort((a: any, b: any) => b.apy - a.apy)
      .slice(0, 5)
      .map((p: any) => ({ pool: p.pool, chain: p.chain, project: p.project, symbol: p.symbol, tvlUsd: p.tvlUsd, apy: p.apy }));
    
    const degenPools = pools
      .filter((p: any) => p.stablecoin && degenSymbols.some(s => p.symbol?.toUpperCase().includes(s)))
      .filter((p: any) => p.tvlUsd >= 1_000_000 && p.apy >= 2)
      .sort((a: any, b: any) => b.apy - a.apy)
      .slice(0, 5)
      .map((p: any) => ({ pool: p.pool, chain: p.chain, project: p.project, symbol: p.symbol, tvlUsd: p.tvlUsd, apy: p.apy }));
    
    return { safe: safePools, degen: degenPools };
  } catch (error) {
    console.error('[Pools] Error:', error);
    return { safe: [], degen: [] };
  }
}

// Error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[x402] Server running on port ${PORT}`);
  console.log(`[x402] Price: $${AGGREGATOR_PRICE_USD} USDC`);
});
