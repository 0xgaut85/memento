/**
 * Memento x402 Express Server
 * Payment gateway for Aggregator access
 * 
 * - Human users: Pay $5 USDC for 24hr access to aggregator
 * - AI agents: Pay $5 USDC per API call, get top 5 safe + top 5 degen pools
 * 
 * Uses official @payai/x402-solana v2 from PayAI Network
 * Docs: https://github.com/PayAINetwork/x402-solana
 */

import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { X402PaymentHandler } from '@payai/x402-solana/server';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const facilitatorUrl = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';
const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS!;
const solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const serverPublicUrl = process.env.X402_PUBLIC_URL || 'https://x402.memento.money';
const mementoAppUrl = process.env.MEMENTO_APP_URL || 'https://app.memento.money';

// USDC Mint addresses
const USDC_MINT_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDC_MINT_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

// Use mainnet by default, devnet for testing
const USDC_MINT = process.env.NODE_ENV === 'development' ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
const NETWORK = process.env.NODE_ENV === 'development' ? 'solana-devnet' : 'solana';

// Price: $5 USDC = 5,000,000 micro-units (6 decimals)
const AGGREGATOR_PRICE = '5000000';
const AGGREGATOR_PRICE_USD = 5.00;

if (!treasuryAddress) {
  console.error('Missing required environment variable: TREASURY_WALLET_ADDRESS');
  process.exit(1);
}

const app = express();

// Trust proxy for Railway
app.set('trust proxy', true);

// Health check - must be before any middleware
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Memento x402 Server', 
    timestamp: new Date().toISOString() 
  });
});

// CORS configuration for x402 headers
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (_req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

app.use(express.json());

// Serve static files from public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Favicon route
app.get('/favicon.ico', (_req, res) => {
  res.redirect('/public/favicon.png');
});

app.get('/favicon.png', (_req, res) => {
  res.redirect('/public/favicon.png');
});

// Landing page
app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Memento x402 Server</title>
    <meta name="description" content="A new global privacy focused standard for earning yield on stablecoins, on-chain and beyond." />
    <meta property="og:title" content="Memento x402 Server" />
    <meta property="og:description" content="A new global privacy focused standard for earning yield on stablecoins, on-chain and beyond." />
    <meta property="og:image" content="${serverPublicUrl}/public/favicon.png" />
    <meta property="og:url" content="${serverPublicUrl}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Memento x402 Server" />
    <meta name="twitter:description" content="A new global privacy focused standard for earning yield on stablecoins, on-chain and beyond." />
    <link rel="icon" type="image/png" href="/public/favicon.png" />
    <link rel="apple-touch-icon" href="/public/favicon.png" />
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 2.5rem; margin: 0; min-height: 100vh; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%); color: #e5e7eb; display: flex; align-items: center; justify-content: center; }
      .card { width: 100%; max-width: 720px; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px; background: rgba(30,30,40,0.9); backdrop-filter: blur(20px); box-shadow: 0 25px 80px rgba(0,0,0,0.5); }
      .logo { width: 64px; height: 64px; margin-bottom: 16px; border-radius: 12px; }
      h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #ffffff; }
      .bio { margin: 0 0 24px 0; color: #9ca3af; font-size: 15px; line-height: 1.7; }
      .grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
      .pill { padding: 10px 18px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.15); color: #d1d5db; text-decoration: none; transition: all 0.2s ease; font-size: 14px; background: rgba(255,255,255,0.05); }
      .pill:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: #fff; }
      .price { background: rgba(236, 72, 153, 0.15); color: #f472b6; border-color: rgba(236, 72, 153, 0.3); }
      .footer { font-size: 12px; color: #6b7280; }
      .footer a { color: #9ca3af; text-decoration: none; }
      .footer a:hover { color: #fff; }
    </style>
  </head>
  <body>
    <div class="card">
      <img src="/public/favicon.png" alt="Memento" class="logo" />
      <h1>Memento x402 Server</h1>
      <p class="bio">A new global privacy focused standard for earning yield on stablecoins, on-chain and beyond.</p>
      <div class="grid">
        <a class="pill" href="/health">Health</a>
        <a class="pill" href="/aggregator/solana">Aggregator API</a>
        <span class="pill price">$5 USDC / 24hr access</span>
      </div>
      <p class="footer">
        <a href="https://memento.money" target="_blank">memento.money</a> · 
        <a href="https://app.memento.money" target="_blank">app.memento.money</a> · 
        x402.memento.money
      </p>
    </div>
  </body>
</html>`);
});

// --- x402-solana v2 Payment Handler ---
// Exactly as per docs: https://github.com/PayAINetwork/x402-solana#server-side-express
const x402Handler = new X402PaymentHandler({
  network: NETWORK as 'solana' | 'solana-devnet',
  treasuryAddress,
  facilitatorUrl,
  rpcUrl: solanaRpcUrl,
});

console.log('[x402-server] Solana x402 payments enabled (v2)');
console.log('[x402-server] Treasury address:', treasuryAddress);
console.log('[x402-server] Network:', NETWORK);
console.log('[x402-server] Facilitator:', facilitatorUrl);

// Helper: Get or create user
async function getOrCreateUser(address: string) {
  let user = await prisma.user.findUnique({ where: { address } });
  if (!user) {
    user = await prisma.user.create({ data: { address } });
  }
  return user;
}

// Helper: Check if user has active aggregator access
async function hasActiveAccess(userId: string): Promise<boolean> {
  const access = await prisma.aggregatorAccess.findFirst({
    where: {
      userId,
      active: true,
      expiresAt: { gt: new Date() },
    },
  });
  return !!access;
}

// Helper: Grant 24hr access to user
async function grantAccess(userId: string, paymentId: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  
  return prisma.aggregatorAccess.create({
    data: {
      userId,
      grantedAt: now,
      expiresAt,
      active: true,
      paymentId,
    },
  });
}

// --- AGGREGATOR ENDPOINT (x402 protected) ---
// POST /aggregator/solana
// Exactly as per docs: https://github.com/PayAINetwork/x402-solana#server-side-express
app.post('/aggregator/solana', async (req, res) => {
  try {
    const { userAddress, accessType = 'human' } = req.body;
    const resourceUrl = `${serverPublicUrl}/aggregator/solana`;
    
    // Validate input
    if (!userAddress) {
      return res.status(400).json({ error: 'Missing userAddress in request body' });
    }
    
    // Check for existing access (human users only)
    if (accessType === 'human') {
      const user = await prisma.user.findUnique({ where: { address: userAddress } });
      if (user) {
        const hasAccess = await hasActiveAccess(user.id);
        if (hasAccess) {
          // User already has access, return success
          const access = await prisma.aggregatorAccess.findFirst({
            where: { userId: user.id, active: true, expiresAt: { gt: new Date() } },
          });
          return res.json({
            success: true,
            accessGranted: true,
            alreadyHadAccess: true,
            expiresAt: access?.expiresAt?.toISOString(),
            message: 'You already have active access to the aggregator',
          });
        }
      }
    }
    
    // 1. Extract payment header (v2 uses PAYMENT-SIGNATURE)
    const paymentHeader = x402Handler.extractPayment(req.headers as Record<string, string | string[] | undefined>);
    
    // 2. Create payment requirements - v2 API
    const paymentRequirements = await x402Handler.createPaymentRequirements(
      {
        amount: AGGREGATOR_PRICE, // $5 USDC in micro-units (string)
        asset: {
          address: USDC_MINT,
          decimals: 6,
        },
        description: 'Memento Aggregator - 24hr Premium Access',
      },
      resourceUrl
    );
    
    // If no payment header, return 402 Payment Required
    if (!paymentHeader) {
      const response402 = x402Handler.create402Response(paymentRequirements, resourceUrl);
      return res.status(402).json({
        ...response402.body,
        priceUsd: AGGREGATOR_PRICE_USD,
        description: 'Access to Memento Stablecoin Yield Aggregator',
      });
    }
    
    // 3. Verify payment with facilitator
    const verifyResult = await x402Handler.verifyPayment(paymentHeader, paymentRequirements);
    
    if (!verifyResult.isValid) {
      console.error('[x402] Payment verification failed:', verifyResult.invalidReason);
      return res.status(402).json({
        error: 'Invalid payment',
        reason: verifyResult.invalidReason,
      });
    }
    
    // 4. Process business logic (grant access)
    const user = await getOrCreateUser(userAddress);
    
    // Record payment
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
    
    // 5. Settle payment with facilitator
    const settleResult = await x402Handler.settlePayment(paymentHeader, paymentRequirements);
    
    if (!settleResult.success) {
      console.error('[x402] Payment settlement failed:', settleResult.errorReason);
      // Note: We still grant access since payment was verified
    }
    
    console.log('[x402] Payment verified and settled for:', userAddress);
    
    // 6. Return response based on access type
    if (accessType === 'agent') {
      // AI agent: Return top pools immediately
      const pools = await fetchTopPools();
      
      return res.json({
        success: true,
        accessGranted: true,
        accessType: 'agent',
        pools,
        paymentId: payment.id,
      });
    } else {
      // Human user: Grant 24hr access
      const access = await grantAccess(user.id, payment.id);
      
      return res.json({
        success: true,
        accessGranted: true,
        accessType: 'human',
        expiresAt: access.expiresAt.toISOString(),
        message: 'Access granted for 24 hours. Enjoy the aggregator!',
        paymentId: payment.id,
      });
    }
  } catch (error) {
    console.error('[Aggregator] Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// GET /api/access/check - Check if user has active access (no payment required)
app.get('/api/access/check', async (req, res) => {
  try {
    const userAddress = req.query.userAddress as string;
    
    if (!userAddress) {
      return res.status(400).json({ error: 'Missing userAddress query parameter' });
    }
    
    const user = await prisma.user.findUnique({ where: { address: userAddress } });
    
    if (!user) {
      return res.json({ hasAccess: false });
    }
    
    const access = await prisma.aggregatorAccess.findFirst({
      where: {
        userId: user.id,
        active: true,
        expiresAt: { gt: new Date() },
      },
    });
    
    if (!access) {
      return res.json({ hasAccess: false });
    }
    
    return res.json({
      hasAccess: true,
      expiresAt: access.expiresAt.toISOString(),
      remainingHours: Math.max(0, Math.round((access.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60) * 10) / 10),
    });
  } catch (error) {
    console.error('[Access Check] Error:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
});

// GET /api/aggregator - Get aggregator data (requires active access for human, payment for agents)
app.get('/api/aggregator', async (req, res) => {
  try {
    const userAddress = req.query.userAddress as string;
    
    if (!userAddress) {
      return res.status(400).json({ error: 'Missing userAddress query parameter' });
    }
    
    const user = await prisma.user.findUnique({ where: { address: userAddress } });
    
    if (!user) {
      return res.status(403).json({ 
        error: 'No access', 
        message: 'Please purchase access first via POST /aggregator/solana' 
      });
    }
    
    const hasAccess = await hasActiveAccess(user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access expired', 
        message: 'Your access has expired. Please purchase again via POST /aggregator/solana' 
      });
    }
    
    // Return aggregator redirect - user accesses the main app
    return res.json({
      success: true,
      hasAccess: true,
      aggregatorUrl: `${mementoAppUrl}/aggregator`,
      message: 'You have active access. Visit the aggregator URL.',
    });
  } catch (error) {
    console.error('[API Aggregator] Error:', error);
    res.status(500).json({ error: 'Failed to get aggregator data' });
  }
});

// Helper: Fetch top pools from DefiLlama (for AI agents)
async function fetchTopPools() {
  try {
    const response = await fetch('https://yields.llama.fi/pools');
    const data = await response.json();
    
    if (!data.data) {
      return { safe: [], degen: [] };
    }
    
    const pools = data.data;
    
    // Safe mode: Basic stablecoins, TVL > $25M
    const safeSymbols = ['USDC', 'USDT', 'DAI', 'USDS', 'USDG', 'PYUSD'];
    const safePools = pools
      .filter((p: any) => p.stablecoin === true)
      .filter((p: any) => safeSymbols.some((s) => p.symbol?.toUpperCase().includes(s)))
      .filter((p: any) => p.tvlUsd >= 25_000_000)
      .filter((p: any) => p.apy >= 2)
      .sort((a: any, b: any) => b.apy - a.apy)
      .slice(0, 5)
      .map((p: any) => ({
        pool: p.pool,
        chain: p.chain,
        project: p.project,
        symbol: p.symbol,
        tvlUsd: p.tvlUsd,
        apy: p.apy,
        apyBase: p.apyBase,
        apyReward: p.apyReward,
      }));
    
    // Degen mode: Exotic stablecoins, TVL > $1M
    const degenSymbols = ['USDE', 'SUSDE', 'SUSD', 'SFRAX', 'FRAX', 'CRVUSD', 'GHO', 'LUSD', 'MIM', 'EUSD'];
    const degenPools = pools
      .filter((p: any) => p.stablecoin === true)
      .filter((p: any) => degenSymbols.some((s) => p.symbol?.toUpperCase().includes(s)))
      .filter((p: any) => p.tvlUsd >= 1_000_000)
      .filter((p: any) => p.apy >= 2)
      .sort((a: any, b: any) => b.apy - a.apy)
      .slice(0, 5)
      .map((p: any) => ({
        pool: p.pool,
        chain: p.chain,
        project: p.project,
        symbol: p.symbol,
        tvlUsd: p.tvlUsd,
        apy: p.apy,
        apyBase: p.apyBase,
        apyReward: p.apyReward,
      }));
    
    return { safe: safePools, degen: degenPools };
  } catch (error) {
    console.error('[FetchPools] Error:', error);
    return { safe: [], degen: [] };
  }
}

// Error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]:', err);
  const errorMessage = err instanceof Error ? err.message : 'An error occurred';
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`[x402-server] Memento server running on port ${PORT}`);
  console.log(`[x402-server] Aggregator price: $${AGGREGATOR_PRICE_USD} USDC`);
});
