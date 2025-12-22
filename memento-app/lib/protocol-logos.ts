/**
 * Protocol logo mapping
 * Maps protocol names (lowercase) to their logo paths
 */

// Available logos in /cryptologo/
const PROTOCOL_LOGOS: Record<string, string> = {
  // Protocols - matching DefiLlama naming
  "aave": "/cryptologo/aave.png",
  "aave-v2": "/cryptologo/aave.png",
  "aave-v3": "/cryptologo/aave.png",
  "compound": "/cryptologo/Compound.png",
  "compound-v2": "/cryptologo/Compound.png",
  "compound-v3": "/cryptologo/Compound.png",
  "curve": "/cryptologo/Curve.jpg",
  "curve-dex": "/cryptologo/Curve.jpg",
  "drift": "/cryptologo/Drift.png",
  "drift-staked-sol": "/cryptologo/Drift.png",
  "ethena": "/cryptologo/Ethena.png",
  "ethena-usde": "/cryptologo/Ethena.png",
  "fluid": "/cryptologo/Fluid.png",
  "fluid-lending": "/cryptologo/Fluid.png",
  "jupiter": "/cryptologo/jupiter.jpg",
  "jupiter-lend": "/cryptologo/jupiter.jpg",
  "jupiter-lending": "/cryptologo/jupiter.jpg",
  "jup-lend": "/cryptologo/jupiter.jpg",
  "jup-lending": "/cryptologo/jupiter.jpg",
  "jupiter-perps": "/cryptologo/jupiter.jpg",
  "jlp": "/cryptologo/jupiter.jpg",
  "justlend": "/cryptologo/JustLend.jpg",
  "kamino": "/cryptologo/Kamino.jpg",
  "kamino-lending": "/cryptologo/Kamino.jpg",
  "kamino-lend": "/cryptologo/Kamino.jpg",
  "maple": "/cryptologo/Maple.jpg",
  "marinade": "/cryptologo/Marinade.jpg",
  "marinade-finance": "/cryptologo/Marinade.jpg",
  "merkl": "/cryptologo/Merkl.jpg",
  "morpho": "/cryptologo/Morpho.jpg",
  "morpho-blue": "/cryptologo/Morpho.jpg",
  "morpho-v1": "/cryptologo/Morpho.jpg",
  "orca": "/cryptologo/Orca.jpg",
  "pendle": "/cryptologo/Pendle.jpg",
  "raydium": "/cryptologo/raydium.jpg",
  "yearn": "/cryptologo/Yearn.jpg",
  "yearn-finance": "/cryptologo/Yearn.jpg",
  "resolv": "/cryptologo/Resolv.png",
  "sky": "/cryptologo/Spark.jpg",
  "sky-lending": "/cryptologo/Spark.jpg",
  "spark": "/cryptologo/Spark.jpg",
  "spark-lending": "/cryptologo/Spark.jpg",
  "uniswap": "/cryptologo/uniswap.jpg",
  "uniswap-v3": "/cryptologo/uniswap.jpg",
  "usual": "/cryptologo/Usual.jpg",
};

// Chain logos
const CHAIN_LOGOS: Record<string, string> = {
  "ethereum": "/cryptologo/ethereum.jpg",
  "base": "/cryptologo/base.jpg",
  "solana": "/cryptologo/solana.jpg",
  "arbitrum": "/cryptologo/arbitrum.jpg",
  "optimism": "/cryptologo/optimism.jpg",
  "polygon": "/cryptologo/polygon.jpg",
  "bsc": "/cryptologo/BSC.jpg",
  "binance": "/cryptologo/BSC.jpg",
  "plasma": "/cryptologo/Plasma.jpg",
  "tron": "/cryptologo/Tron.jpg",
  "avalanche": "/cryptologo/avalanche.svg",
};

// Stablecoin logos
const STABLECOIN_LOGOS: Record<string, string> = {
  "usdc": "/cryptologo/USDC.png",
  "usdc.e": "/cryptologo/USDC.png",
  "usdce": "/cryptologo/USDC.png",
  "usdt": "/cryptologo/USDT.png",
  "usdt.e": "/cryptologo/USDT.png",
  "dai": "/cryptologo/DAI.png",
  "gho": "/cryptologo/GHO.png",
  "usds": "/cryptologo/USDS.png",
  "usde": "/cryptologo/USDe.png",
  "susds": "/cryptologo/sUSDS.png",
  "susde": "/cryptologo/USDe.png",
  "crvusd": "/cryptologo/crvUSD.png",
  "pyusd": "/cryptologo/pyUSD.png",
  "usdg": "/cryptologo/usdg.png",
};

// Chain colors for badges
export const CHAIN_COLORS: Record<string, string> = {
  "ethereum": "#627EEA",
  "arbitrum": "#28A0F0",
  "optimism": "#FF0420",
  "polygon": "#8247E5",
  "base": "#0052FF",
  "solana": "#14F195",
  "avalanche": "#E84142",
  "bsc": "#F0B90B",
  "fantom": "#1969FF",
  "gnosis": "#04795B",
};

/**
 * Get the logo path for a protocol
 * @param protocol - Protocol name from DefiLlama
 * @returns Logo path or null if not found
 */
export function getProtocolLogo(protocol: string): string | null {
  const key = protocol.toLowerCase().replace(/\s+/g, "-");
  return PROTOCOL_LOGOS[key] || null;
}

/**
 * Get the logo path for a chain
 * @param chain - Chain name from DefiLlama
 * @returns Logo path or null if not found
 */
export function getChainLogo(chain: string): string | null {
  const key = chain.toLowerCase();
  return CHAIN_LOGOS[key] || null;
}

/**
 * Get the logo path for a stablecoin symbol
 * @param symbol - Token symbol (e.g., "USDC", "USDT", "USDC-USDT")
 * @returns Logo path or null if not found
 */
export function getStablecoinLogo(symbol: string): string | null {
  // Try exact match first
  const key = symbol.toLowerCase();
  if (STABLECOIN_LOGOS[key]) return STABLECOIN_LOGOS[key];
  
  // Try to find the main stablecoin in the symbol (e.g., "USDC" in "USDC-ETH")
  const stablecoins = Object.keys(STABLECOIN_LOGOS);
  for (const stable of stablecoins) {
    if (key.includes(stable)) {
      return STABLECOIN_LOGOS[stable];
    }
  }
  
  return null;
}

/**
 * Get chain color for badges
 */
export function getChainColor(chain: string): string {
  return CHAIN_COLORS[chain.toLowerCase()] || "#6B7280";
}

/**
 * Generate a consistent color from a string (for fallback avatars)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#06B6D4", // Cyan
    "#84CC16", // Lime
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * List of protocols we have logos for
 * Used to identify which logos are missing
 */
export const AVAILABLE_PROTOCOL_LOGOS = [
  "aave",
  "curve",
  "ethena",
  "fluid",
  "jupiter",
  "kamino",
  "maple",
  "marinade",
  "morpho",
  "orca",
  "raydium",
  "sky",
  "spark",
  "uniswap",
];

/**
 * Clean up protocol names for display
 * Converts "sky-lending" to "Sky", "aave-v3" to "Aave", etc.
 */
export function cleanProtocolName(rawName: string): string {
  // Remove common suffixes
  let cleaned = rawName
    .replace(/-v\d+$/i, "") // Remove -v2, -v3, etc.
    .replace(/-lending$/i, "")
    .replace(/-lend$/i, "")
    .replace(/-usde$/i, "")
    .replace(/-usdc$/i, "")
    .replace(/-finance$/i, "")
    .replace(/-dex$/i, "")
    .replace(/-perps$/i, "")
    .replace(/-blue$/i, "")
    .replace(/-staked-sol$/i, "")
    .replace(/-labs-usdx$/i, "");
  
  // Capitalize first letter of each word
  cleaned = cleaned
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  
  // Special cases for proper capitalization
  const specialCases: Record<string, string> = {
    "Aave": "Aave",
    "Usdc": "USDC",
    "Usdt": "USDT",
    "Justlend": "JustLend",
    "Morpho": "Morpho",
    "Defi": "DeFi",
  };
  
  for (const [key, value] of Object.entries(specialCases)) {
    cleaned = cleaned.replace(new RegExp(key, "gi"), value);
  }
  
  return cleaned.trim();
}

