import { Pool, PoolsResponse, PoolChartData, PoolChartResponse } from "@/types/pool";

const YIELDS_API_BASE = "https://yields.llama.fi";

/**
 * SAFE MODE: Basic USD stablecoins only (fiat-backed or over-collateralized)
 * Single asset only, no pools
 */
const SAFE_STABLECOIN_SYMBOLS = [
  "USDC", "USDT", "DAI", "FRAX", "LUSD", "TUSD", "USDP", "GUSD",
  "BUSD", "DOLA", "GHO", "PYUSD", "USDS", "FDUSD", "USDC.E", "USDT.E",
  "USDBC", "AXLUSDC", "USD0", "USDG",
];

/**
 * DEGEN MODE: Exotic stablecoins, staked versions, LP pools
 * Does NOT include basic stablecoins (those are in safe mode)
 */
const DEGEN_STABLECOIN_SYMBOLS = [
  // Exotic/algorithmic stablecoins
  "SUSD", "MIM", "CRVUSD", "USD1", "USDD", "EUSD", "USDE", "ALUSD", "DOLA",
  "USD+", "USDB", "USDZ", "USDX", "USR", "CUSD", "EURS", "EURA", "AGEUR",
  "USDM", "ULTRA", "ZUSD", "OUSD", "MUSD", "RSR", "FEI", "RAI", "BEAN",
  // Staked/wrapped versions (yield-bearing stablecoins)
  "SUSDE", "SDAI", "SUSDS", "SCRVUSD", "SFRAX", "SFRXUSD", "WUSDM",
  "STUSD", "SCUSD", "STEAKUSDC", "STEAKPYUSD",
  // LP pairs containing stablecoins (common patterns)
  "USDC-USDT", "USDC-DAI", "DAI-USDC", "USDT-USDC", "3CRV",
  "FRAX-USDC", "GHO-USDC", "USDS-USDC", "CRVUSD-USDC", "USDE-USDC",
  "GHO-USDT", "DAI-USDT", "FRAX-USDT", "LUSD-USDC", "USDE-DAI",
  "USDC-CRVUSD", "USDT-CRVUSD", "GHO-CRVUSD", "USDE-USDT", "MIM-3CRV",
  "FRAX-3CRV", "LUSD-3CRV", "SUSD-3CRV", "TUSD-3CRV", "GUSD-3CRV",
];

// Chains to exclude from safe mode (less trusted)
const EXCLUDED_CHAINS_SAFE_MODE = ["tron"];

// TVL thresholds
const SAFE_MODE_MIN_TVL = 25_000_000; // $25M for safe mode
const DEGEN_MODE_MIN_TVL = 1_000_000; // $1M for degen mode

/**
 * Symbols that DefiLlama incorrectly flags as stablecoins
 * These should ALWAYS be excluded
 */
const BLOCKLIST_SYMBOLS = [
  "DSOL", "JITOSOL", "JUPSOL", "MSOL", "VSOL", "BNSOL", // Liquid staking tokens (not stablecoins!)
  "CBBTC", "WBTC", "TBTC", "SBTC", // BTC tokens
  "WETH", "STETH", "WSTETH", "RETH", "CBETH", // ETH tokens
  "SOL", "WSOL", // SOL tokens
];

/**
 * Fetches all yield pools from DeFi Llama
 * @see https://api-docs.defillama.com/#tag/yields/get/pools
 */
export async function fetchPools(): Promise<Pool[]> {
  const response = await fetch(`${YIELDS_API_BASE}/pools`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pools: ${response.statusText}`);
  }

  const data: PoolsResponse = await response.json();
  
  if (data.status !== "success") {
    throw new Error("API returned unsuccessful status");
  }

  return data.data;
}

/**
 * Fetches historical APY and TVL data for a specific pool
 * Uses local API proxy to avoid CORS issues
 * @see https://api-docs.defillama.com/#tag/yields/get/chart/{pool}
 */
export async function fetchPoolChart(poolId: string): Promise<PoolChartData[]> {
  try {
    // Use local API proxy to avoid CORS issues with DefiLlama
    const response = await fetch(`/api/chart/${encodeURIComponent(poolId)}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.warn(`[DefiLlama] Chart API returned ${response.status} for ${poolId}`);
      return [];
    }

    const data: PoolChartResponse = await response.json();
    
    if (data.status !== "success") {
      return [];
    }

    return data.data;
  } catch (error) {
    console.warn(`[DefiLlama] Chart fetch failed for ${poolId}:`, error);
    return [];
  }
}

/**
 * Get unique chains from pools data
 */
export function getUniqueChains(pools: Pool[]): string[] {
  const chains = new Set(pools.map((pool) => pool.chain));
  return Array.from(chains).sort();
}

/**
 * Get unique projects from pools data
 */
export function getUniqueProjects(pools: Pool[]): string[] {
  const projects = new Set(pools.map((pool) => pool.project));
  return Array.from(projects).sort();
}

// Legacy constant (kept for compatibility)
export const MIN_TVL_THRESHOLD = 1_000_000;

// Known protocols we want to display (have logos or are well-known)
const KNOWN_PROTOCOLS = [
  "aave", "aave-v2", "aave-v3",
  "compound", "compound-v2", "compound-v3",
  "curve", "curve-dex",
  "drift", "drift-staked-sol",
  "ethena", "ethena-usde",
  "fluid", "fluid-lending",
  "jupiter", "jupiter-perps", "jupiter-lend", "jupiter-lending", "jlp", "jup", "jup-lend", "jup-lending",
  "justlend",
  "kamino", "kamino-lending", "kamino-lend",
  "lido",
  "maker",
  "maple",
  "marinade", "marinade-finance",
  "merkl",
  "morpho", "morpho-blue", "morpho-v1",
  "orca",
  "pendle",
  "raydium",
  "resolv",
  "sky", "sky-lending",
  "spark", "spark-lending",
  "uniswap", "uniswap-v3",
  "usual",
  "yearn", "yearn-finance",
];

/**
 * Check if a protocol is known/supported
 */
function isKnownProtocol(project: string): boolean {
  const normalized = project.toLowerCase();
  return KNOWN_PROTOCOLS.includes(normalized);
}

/**
 * Check if symbol is in blocklist (things DefiLlama incorrectly flags as stablecoins)
 */
function isBlocklisted(symbol: string): boolean {
  const upperSymbol = symbol.toUpperCase().trim();
  return BLOCKLIST_SYMBOLS.some(blocked => upperSymbol === blocked || upperSymbol.includes(blocked));
}

/**
 * Check if symbol is a valid stablecoin for SAFE mode (basic stablecoins only)
 */
function isSafeStablecoin(symbol: string): boolean {
  const upperSymbol = symbol.toUpperCase().trim();
  
  return SAFE_STABLECOIN_SYMBOLS.some(stable => {
    const upperStable = stable.toUpperCase();
    // Exact match
    if (upperSymbol === upperStable) return true;
    // Handle variations like "USDC.E", bridged versions
    if (upperSymbol.replace(".", "") === upperStable.replace(".", "")) return true;
    return false;
  });
}

/**
 * Check if symbol is a valid stablecoin for DEGEN mode (exotic only, no basic)
 * More permissive matching - includes any pool with exotic stablecoins
 */
function isDegenStablecoin(symbol: string): boolean {
  const upperSymbol = symbol.toUpperCase().trim();
  
  // First check it's NOT a basic stablecoin (single asset)
  if (isSafeStablecoin(symbol)) return false;
  
  // Check if it matches any degen symbol (exact or contained)
  return DEGEN_STABLECOIN_SYMBOLS.some(stable => {
    const upperStable = stable.toUpperCase();
    // Exact match
    if (upperSymbol === upperStable) return true;
    // Handle variations
    if (upperSymbol.replace(".", "") === upperStable.replace(".", "")) return true;
    // Symbol contains the degen stablecoin (e.g., "SUSDE-USDC" contains "SUSDE")
    if (upperSymbol.includes(upperStable)) return true;
    // For LP pairs, check if the pair is contained in symbol
    if (upperStable.includes("-") && upperSymbol.includes(upperStable)) return true;
    return false;
  });
}

export type PoolMode = "safe" | "degen";

/**
 * Get top stablecoin pools by TVL
 * @param pools - All pools from DefiLlama
 * @param mode - "safe" for basic stablecoins only, "degen" for exotic stablecoins & pools
 * @param limit - Maximum number of pools to return
 */
export function getTopStablecoinPools(pools: Pool[], mode: PoolMode = "safe", limit = 50): Pool[] {
  const degenMode = mode === "degen";
  const minTvl = degenMode ? DEGEN_MODE_MIN_TVL : SAFE_MODE_MIN_TVL;
  
  const filtered = pools
    // First, exclude blocklisted symbols (incorrectly flagged as stablecoins)
    .filter(pool => !isBlocklisted(pool.symbol))
    // Must be flagged as stablecoin by DefiLlama
    .filter(pool => pool.stablecoin === true)
    // Exclude certain chains from safe mode (e.g., Tron/JustLend)
    .filter(pool => degenMode || !EXCLUDED_CHAINS_SAFE_MODE.includes(pool.chain.toLowerCase()))
    // Filter by mode: safe = basic stablecoins, degen = exotic only
    .filter(pool => degenMode ? isDegenStablecoin(pool.symbol) : isSafeStablecoin(pool.symbol))
    // Only show known protocols (ones we have logos for or are well-known)
    .filter(pool => isKnownProtocol(pool.project))
    // Apply TVL threshold based on mode
    .filter(pool => pool.tvlUsd >= minTvl)
    // Must have APY > 2%
    .filter(pool => pool.apy >= 2)
    // Sort by APY descending (best yields first)
    .sort((a, b) => b.apy - a.apy)
    // Take top N
    .slice(0, limit);
  
  console.log(`[DefiLlama] Mode: ${mode}, MinTVL: $${(minTvl / 1_000_000).toFixed(1)}M, Total: ${pools.length}, Filtered: ${filtered.length}`);
  
  return filtered;
}

/**
 * Build the URL for a pool based on project, chain, and symbol
 * Points to the actual staking/lending page, not just the landing page
 */
export function getPoolUrl(pool: Pool): string {
  const project = pool.project.toLowerCase();
  const chain = pool.chain.toLowerCase();
  const symbol = pool.symbol.toUpperCase();
  
  // Chain-specific Aave URLs
  const aaveChainMap: Record<string, string> = {
    "ethereum": "https://app.aave.com/?marketName=proto_mainnet_v3",
    "arbitrum": "https://app.aave.com/?marketName=proto_arbitrum_v3",
    "optimism": "https://app.aave.com/?marketName=proto_optimism_v3",
    "polygon": "https://app.aave.com/?marketName=proto_polygon_v3",
    "base": "https://app.aave.com/?marketName=proto_base_v3",
    "avalanche": "https://app.aave.com/?marketName=proto_avalanche_v3",
    "bsc": "https://app.aave.com/?marketName=proto_bnb_v3",
  };
  
  // Chain-specific Compound URLs
  const compoundChainMap: Record<string, string> = {
    "ethereum": "https://app.compound.finance/markets/usdc-mainnet",
    "arbitrum": "https://app.compound.finance/markets/usdc-arbitrum",
    "base": "https://app.compound.finance/markets/usdc-base",
    "polygon": "https://app.compound.finance/markets/usdc-polygon",
  };
  
  // Protocol-specific URLs with proper staking/lending pages
  if (project.includes("aave")) {
    return aaveChainMap[chain] || "https://app.aave.com/";
  }
  
  if (project.includes("compound")) {
    return compoundChainMap[chain] || "https://app.compound.finance/markets";
  }
  
  // Direct staking/lending URLs for other protocols
  const protocolUrls: Record<string, string> = {
    // Morpho
    "morpho": "https://app.morpho.org/earn",
    "morpho-blue": "https://app.morpho.org/earn",
    
    // Spark/Sky
    "spark": "https://app.spark.fi/markets/",
    "spark-lending": "https://app.spark.fi/markets/",
    "sky": "https://app.sky.money/savings/",
    "sky-lending": "https://app.sky.money/savings/",
    
    // Curve ecosystem
    "curve-dex": "https://curve.fi/#/ethereum/pools",
    "curve": "https://curve.fi/#/ethereum/pools",
    "convex-finance": "https://www.convexfinance.com/stake",
    
    // Yearn
    "yearn": "https://yearn.fi/v3",
    "yearn-finance": "https://yearn.fi/v3",
    
    // Liquid staking
    "lido": "https://stake.lido.fi/",
    "rocket-pool": "https://stake.rocketpool.net/",
    
    // DeFi lending
    "fluid": "https://fluid.instadapp.io/lending",
    "maple": "https://app.maple.finance/lend",
    
    // Solana protocols
    "jupiter-lend": "https://jup.ag/earn",
    "kamino": "https://app.kamino.finance/lending",
    "kamino-lend": "https://app.kamino.finance/lending",
    "kamino-lending": "https://app.kamino.finance/lending",
    "marinade-finance": "https://marinade.finance/app/stake/",
    "orca": "https://www.orca.so/pools",
    "raydium": "https://raydium.io/liquidity-pools/",
    "drift": "https://app.drift.trade/earn",
    
    // Ethena
    "ethena": "https://app.ethena.fi/earn",
    "ethena-usde": "https://app.ethena.fi/earn",
    
    // Pendle
    "pendle": "https://app.pendle.finance/trade/markets",
    
    // Others
    "uniswap-v3": "https://app.uniswap.org/pool",
    "resolv": "https://app.resolv.xyz/",
    "usual": "https://app.usual.money/",
    "justlend": "https://justlend.org/#/market",
    "merkl": "https://merkl.angle.money/",
  };
  
  return protocolUrls[project] || `https://defillama.com/protocol/${project}`;
}

/**
 * Filter pools based on search query
 */
export function searchPools(pools: Pool[], query: string): Pool[] {
  if (!query.trim()) return pools;
  
  const searchLower = query.toLowerCase().trim();
  
  return pools.filter(pool => 
    pool.project.toLowerCase().includes(searchLower) ||
    pool.symbol.toLowerCase().includes(searchLower) ||
    pool.chain.toLowerCase().includes(searchLower)
  );
}

/**
 * Sort pools by different criteria
 */
export function sortPools(
  pools: Pool[],
  sortBy: "apy" | "tvl" = "tvl",
  direction: "asc" | "desc" = "desc"
): Pool[] {
  return [...pools].sort((a, b) => {
    const valueA = sortBy === "apy" ? a.apy : a.tvlUsd;
    const valueB = sortBy === "apy" ? b.apy : b.tvlUsd;
    return direction === "desc" ? valueB - valueA : valueA - valueB;
  });
}
