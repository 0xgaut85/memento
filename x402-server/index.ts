/**
 * Memento x402 Express Server
 * Payment gateway for Aggregator access
 * 
 * Using x402-solana v0.1.5 (stable v1 protocol)
 */

import { config } from 'dotenv';
import express from 'express';
import path from 'path';
import { X402PaymentHandler } from 'x402-solana/server';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('[x402] SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[x402] SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS!;
const serverPublicUrl = process.env.X402_PUBLIC_URL || 'https://x402.memento.money';
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

// CORS - allow all for x402 headers (v1 uses X-PAYMENT)
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-PAYMENT, x-payment');
  res.setHeader('Access-Control-Expose-Headers', 'X-PAYMENT, x-payment');
  if (_req.method === 'OPTIONS') return res.status(204).end();
  next();
});

app.use(express.json());

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (_req, res) => res.redirect('/public/favicon.png'));
app.get('/favicon.png', (_req, res) => res.redirect('/public/favicon.png'));

// x402 Discovery endpoint (v1 format)
app.get('/.well-known/x402', (_req, res) => {
  res.json({
    version: '1.0',
    name: 'Memento Stablecoin Yield Aggregator',
    description: 'AI-curated stablecoin yield opportunities. Pay $5 USDC for 24hr access.',
    endpoints: [{
      path: '/aggregator/solana',
      method: 'POST',
      price: { maxAmountRequired: AGGREGATOR_PRICE, currency: 'USDC', decimals: 6, usd: AGGREGATOR_PRICE_USD },
      network: NETWORK,
    }],
    treasury: treasuryAddress,
    facilitator: 'https://facilitator.payai.network',
  });
});

// Landing page with full metadata for x402scan
app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memento x402 Server</title>
  <meta name="description" content="A new global privacy focused standard for earning yield on stablecoins, on-chain and beyond.">
  
  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://x402.memento.money/">
  <meta property="og:title" content="Memento x402 Server">
  <meta property="og:description" content="A new global privacy focused standard for earning yield on stablecoins, on-chain and beyond.">
  <meta property="og:image" content="https://x402.memento.money/public/favicon.png">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Memento x402 Server">
  <meta name="twitter:description" content="A new global privacy focused standard for earning yield on stablecoins, on-chain and beyond.">
  <meta name="twitter:image" content="https://x402.memento.money/public/favicon.png">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/public/favicon.png">
  <link rel="apple-touch-icon" href="/public/favicon.png">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Manrope:wght@400;500;600;800&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Manrope', system-ui, -apple-system, sans-serif; 
      background: #fafafa;
      color: #0a0a0a; 
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    /* Subtle grain texture */
    body::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.03;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
    }
    
    .container { 
      max-width: 480px; 
      text-align: center;
      position: relative;
      z-index: 1;
    }
    
    .logo { 
      width: 80px; 
      height: 80px; 
      margin-bottom: 2rem;
    }
    
    .brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.25rem;
      color: rgba(0,0,0,0.5);
      margin-bottom: 0.5rem;
      letter-spacing: 0.02em;
    }
    
    h1 { 
      font-size: 3.5rem; 
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 1rem;
    }
    
    .tagline { 
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: rgba(0,0,0,0.5); 
      font-size: 1.25rem; 
      margin-bottom: 3rem; 
      line-height: 1.5;
    }
    
    .price-card { 
      background: white;
      border: 1px solid rgba(0,0,0,0.08);
      padding: 2rem 2.5rem;
      margin-bottom: 2.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    
    .price-label-top {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(0,0,0,0.4);
      margin-bottom: 0.75rem;
    }
    
    .price-amount { 
      font-size: 3rem; 
      font-weight: 800; 
      letter-spacing: -0.02em;
      color: #a855f7;
      margin-bottom: 0.5rem;
    }
    
    .price-desc { 
      color: rgba(0,0,0,0.5); 
      font-size: 0.95rem;
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
    }
    
    .links { 
      display: flex; 
      gap: 1rem; 
      justify-content: center; 
      flex-wrap: wrap;
    }
    
    .links a { 
      color: #0a0a0a;
      text-decoration: none; 
      padding: 1rem 2rem;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    
    .links a.primary {
      background: #0a0a0a;
      color: white;
    }
    
    .links a.primary:hover {
      background: #a855f7;
    }
    
    .links a.secondary {
      border: 1px solid rgba(0,0,0,0.15);
      background: white;
    }
    
    .links a.secondary:hover {
      border-color: rgba(0,0,0,0.3);
      background: rgba(0,0,0,0.02);
    }
    
    .footer {
      position: absolute;
      bottom: 2rem;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 0.8rem;
      color: rgba(0,0,0,0.3);
    }
    
    .footer a {
      color: rgba(0,0,0,0.4);
      text-decoration: none;
    }
    
    .footer a:hover {
      color: rgba(0,0,0,0.7);
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="/public/favicon.png" alt="Memento Logo" class="logo">
    <p class="brand">memento.money</p>
    <h1>x402 Server</h1>
    <p class="tagline">A new global privacy focused standard for earning yield on stablecoins, on-chain and beyond.</p>
    <div class="price-card">
      <p class="price-label-top">Aggregator Access</p>
      <div class="price-amount">$5 USDC</div>
      <p class="price-desc">24-hour access to AI-curated yield opportunities</p>
    </div>
    <div class="links">
      <a href="https://app.memento.money" class="primary">Launch App</a>
      <a href="/.well-known/x402" class="secondary">x402 Discovery</a>
    </div>
  </div>
  <div class="footer">
    Powered by <a href="https://x402.org" target="_blank" rel="noopener">x402</a> • <a href="https://memento.money" target="_blank" rel="noopener">memento.money</a>
  </div>
</body>
</html>`);
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

// v1 RouteConfig for payment requirements
// outputSchema is required by x402scan for proper validation
const routeConfig = {
  price: {
    amount: AGGREGATOR_PRICE,
    asset: {
      address: USDC_MINT,
      decimals: 6,
    },
  },
  network: NETWORK as 'solana' | 'solana-devnet',
  config: {
    description: 'Memento Aggregator - 24hr Access',
    outputSchema: {
      input: {
        type: 'http' as const,
        method: 'POST' as const,
        bodyType: 'json' as const,
        bodyFields: {
          userAddress: {
            type: 'string',
            required: true,
            description: 'Solana wallet address of the user requesting access',
          },
          accessType: {
            type: 'string',
            required: false,
            description: 'Type of access: "human" for 24hr access, "agent" for one-time data',
            enum: ['human', 'agent'],
          },
        },
      },
      output: {
        success: { type: 'boolean', description: 'Whether the payment was successful' },
        accessGranted: { type: 'boolean', description: 'Whether access was granted' },
        expiresAt: { type: 'string', description: 'ISO timestamp when access expires' },
        message: { type: 'string', description: 'Human-readable message' },
      },
    },
  },
};

// --- AGGREGATOR ENDPOINT (GET for discovery) ---
// Returns 402 for discovery purposes (v1 format)
app.get('/aggregator/solana', async (_req, res) => {
  const resourceUrl = `${serverPublicUrl}/aggregator/solana`;
  
  try {
    const paymentRequirements = await x402.createPaymentRequirements(routeConfig, resourceUrl);
    const response402 = x402.create402Response(paymentRequirements);
    return res.status(response402.status).json(response402.body);
  } catch (err) {
    console.error('[x402] GET discovery error:', err);
    return res.status(500).json({ error: 'Failed to generate payment requirements' });
  }
});

// --- AGGREGATOR ENDPOINT (POST for actual payments) ---
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
    
    // 1. Extract payment header (v1 uses X-PAYMENT)
    console.log('[x402] === REQUEST RECEIVED ===');
    console.log('[x402] All header keys:', Object.keys(req.headers));
    
    // Manual extraction - Express normalizes headers to lowercase
    const rawHeader = req.headers['x-payment'] as string | undefined;
    console.log('[x402] Raw x-payment header:', rawHeader ? `FOUND (${rawHeader.length} chars)` : 'NOT FOUND');
    
    let paymentHeader: string | undefined;
    try {
      paymentHeader = x402.extractPayment(req.headers);
      console.log('[x402] extractPayment result:', paymentHeader ? `found (${paymentHeader.length} chars)` : 'NOT FOUND');
    } catch (err) {
      console.error('[x402] extractPayment failed:', err);
      return res.status(500).json({ error: 'extractPayment failed', detail: String(err) });
    }
    
    // FALLBACK: If extractPayment fails but raw header exists, use it
    if (!paymentHeader && rawHeader) {
      console.log('[x402] Using raw header as fallback');
      paymentHeader = rawHeader;
    }
    
    // 2. Create payment requirements - v1 RouteConfig format
    let paymentRequirements: Awaited<ReturnType<typeof x402.createPaymentRequirements>>;
    try {
      paymentRequirements = await x402.createPaymentRequirements(routeConfig, resourceUrl);
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
        response402 = x402.create402Response(paymentRequirements);
      } catch (err) {
        console.error('[x402] create402Response failed:', err);
        return res.status(500).json({ error: 'create402Response failed', detail: String(err) });
      }
      return res.status(response402.status).json(response402.body);
    }
    
    console.log('[x402] Payment header found! Proceeding to verify...');
    
    // CRITICAL FIX: Extract the ORIGINAL payment requirements from the payment header
    // The client sends the requirements that were used to build the transaction in payload.accepted
    // We MUST use those, not newly generated ones (which might have different feePayer)
    let originalRequirements = paymentRequirements; // fallback
    try {
      const payloadJson = Buffer.from(paymentHeader, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);
      console.log('[x402] Decoded payload version:', payload.x402Version);
      console.log('[x402] Decoded payload resource:', payload.resource?.url);
      
      // Use the ORIGINAL requirements from the payment (contains correct feePayer)
      if (payload.accepted) {
        originalRequirements = payload.accepted;
        console.log('[x402] Using ORIGINAL requirements from payment header');
        console.log('[x402] Original feePayer:', originalRequirements.extra?.feePayer);
        
        // SECURITY: Verify payTo matches our treasury
        if (originalRequirements.payTo !== treasuryAddress) {
          console.error('[x402] SECURITY: payTo mismatch! Expected:', treasuryAddress, 'Got:', originalRequirements.payTo);
          return res.status(402).json({ error: 'Invalid payment recipient' });
        }
        
        // SECURITY: Verify amount is correct (v1 uses maxAmountRequired)
        const paymentAmount = originalRequirements.maxAmountRequired || originalRequirements.amount;
        if (paymentAmount !== AGGREGATOR_PRICE) {
          console.error('[x402] SECURITY: amount mismatch! Expected:', AGGREGATOR_PRICE, 'Got:', paymentAmount);
          return res.status(402).json({ error: 'Invalid payment amount' });
        }
      }
    } catch (decodeErr) {
      console.error('[x402] Failed to decode payment header, using regenerated requirements:', decodeErr);
    }
    
    // 4. Verify payment using ORIGINAL requirements
    console.log('[x402] Got payment header, length:', paymentHeader.length);
    
    let verified: Awaited<ReturnType<typeof x402.verifyPayment>>;
    try {
      verified = await x402.verifyPayment(paymentHeader, originalRequirements);
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
    
    // 6. Settle payment using ORIGINAL requirements
    try {
      const settlement = await x402.settlePayment(paymentHeader, originalRequirements);
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
