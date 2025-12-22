export interface PoolPrediction {
  predictedClass: string | null;
  predictedProbability: number | null;
  binnedConfidence?: number | null;
}

export interface Pool {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
  rewardTokens: string[] | null;
  underlyingTokens?: string[] | null;
  poolMeta: string | null;
  url?: string;
  predictions?: PoolPrediction | null;
  stablecoin?: boolean;
  ilRisk?: string;
  exposure?: string;
  apyPct1D?: number | null;
  apyPct7D?: number | null;
  apyPct30D?: number | null;
  apyMean30d?: number | null;
}

export interface PoolsResponse {
  status: string;
  data: Pool[];
}

export interface PoolChartData {
  timestamp: string;
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
}

export interface PoolChartResponse {
  status: string;
  data: PoolChartData[];
}

export type SortOption = "apy" | "tvl" | "apyChange";
export type SortDirection = "asc" | "desc";

export interface PoolFilters {
  chain: string | null;
  project: string | null;
  search: string;
  stablecoin: boolean | null;
  sortBy: SortOption;
  sortDirection: SortDirection;
}

