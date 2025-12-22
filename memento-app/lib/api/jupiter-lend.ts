import { Pool } from "@/types/pool";

const JUPITER_LEND_API = "https://api.jup.ag/lend/v1";

// API Key - will be moved to env var for production
const JUPITER_API_KEY = process.env.NEXT_PUBLIC_JUPITER_API_KEY || "c0a15325-45e2-457d-9d1b-218538c5c916";

// Stablecoins we want to include from Jupiter Lend
const STABLECOIN_SYMBOLS = ["USDC", "USDT", "PYUSD", "USDS", "USDG"];

interface JupiterLendAsset {
  address: string;
  chain_id: string;
  name: string;
  symbol: string;
  decimals: number;
  logo_url: string;
  price: string;
  coingecko_id: string;
}

interface JupiterLendToken {
  id: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  assetAddress: string;
  asset: JupiterLendAsset;
  totalAssets: string;
  totalSupply: string;
  convertToShares: string;
  convertToAssets: string;
  rewardsRate: string;
  supplyRate: string;
  totalRate: string;
  rebalanceDifference: string;
}

/**
 * Fetch Jupiter Lend tokens and convert to Pool format
 * @see https://dev.jup.ag/api-reference/lend/earn/tokens
 */
export async function fetchJupiterLendPools(): Promise<Pool[]> {
  try {
    const response = await fetch(`${JUPITER_LEND_API}/earn/tokens`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": JUPITER_API_KEY,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error("[Jupiter Lend] API error:", response.status, response.statusText);
      return [];
    }

    const tokens: JupiterLendToken[] = await response.json();
    
    console.log("[Jupiter Lend] Fetched tokens:", tokens.map(t => ({
      symbol: t.asset.symbol,
      totalRate: t.totalRate,
      totalAssets: t.totalAssets,
    })));

    // Filter for stablecoins and convert to Pool format
    const pools = tokens
      .filter(token => STABLECOIN_SYMBOLS.includes(token.asset.symbol.toUpperCase()))
      .map(token => {
        const assetDecimals = token.asset.decimals;
        const price = parseFloat(token.asset.price);
        const totalAssets = parseFloat(token.totalAssets);
        
        // Calculate TVL: totalAssets is in raw units, need to divide by decimals and multiply by price
        const tvlUsd = (totalAssets / Math.pow(10, assetDecimals)) * price;
        
        // APY is in 1e4 format (500 = 5.00%), so divide by 100 to get percentage
        const apy = parseFloat(token.totalRate) / 100;
        const apyBase = parseFloat(token.supplyRate) / 100;
        const apyReward = parseFloat(token.rewardsRate) / 100;

        return {
          pool: `jupiter-lend-${token.asset.symbol.toLowerCase()}`,
          chain: "Solana",
          project: "jupiter-lend",
          symbol: token.asset.symbol,
          tvlUsd,
          apy,
          apyBase,
          apyReward,
          stablecoin: true,
          exposure: "single" as const,
          poolMeta: token.name,
          underlyingTokens: [token.assetAddress],
          rewardTokens: [],
          url: "https://jup.ag/earn",
        } as Pool;
      });

    console.log("[Jupiter Lend] Stablecoin pools:", pools.map(p => ({
      symbol: p.symbol,
      apy: p.apy.toFixed(2) + "%",
      tvl: "$" + (p.tvlUsd / 1_000_000).toFixed(2) + "M",
    })));

    return pools;
  } catch (error) {
    console.error("[Jupiter Lend] Failed to fetch:", error);
    return [];
  }
}

