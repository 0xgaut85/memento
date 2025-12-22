"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Pool } from "@/types/pool";
import {
  fetchPools,
  fetchPoolChart,
  getTopStablecoinPools,
  searchPools,
  sortPools,
  PoolMode,
} from "@/lib/api/defillama";
import { fetchJupiterLendPools } from "@/lib/api/jupiter-lend";
import { PoolChartData } from "@/types/pool";

interface UsePoolsReturn {
  pools: Pool[];
  filteredPools: Pool[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: "apy" | "tvl";
  setSortBy: (sort: "apy" | "tvl") => void;
  mode: PoolMode;
  setMode: (mode: PoolMode) => void;
  refetch: () => Promise<void>;
}

export function usePools(): UsePoolsReturn {
  const [allPools, setAllPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"apy" | "tvl">("apy");
  const [mode, setMode] = useState<PoolMode>("safe");

  const loadPools = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both DefiLlama and Jupiter Lend in parallel
      const [defiLlamaPools, jupiterLendPools] = await Promise.all([
        fetchPools(),
        fetchJupiterLendPools(),
      ]);
      
      console.log(`[Pools] DefiLlama: ${defiLlamaPools.length}, Jupiter Lend: ${jupiterLendPools.length}`);
      
      // Merge pools (Jupiter Lend first for visibility)
      setAllPools([...jupiterLendPools, ...defiLlamaPools]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch pools"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  // Get top stablecoin pools based on mode
  const pools = useMemo(() => getTopStablecoinPools(allPools, mode, 50), [allPools, mode]);

  // Apply search and sort
  const filteredPools = useMemo(() => {
    let result = searchPools(pools, searchQuery);
    result = sortPools(result, sortBy, "desc");
    return result;
  }, [pools, searchQuery, sortBy]);

  return {
    pools,
    filteredPools,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    mode,
    setMode,
    refetch: loadPools,
  };
}

/**
 * Hook to fetch chart data for a specific pool
 */
export function usePoolChart(poolId: string | null) {
  const [data, setData] = useState<PoolChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!poolId) {
      setData([]);
      return;
    }

    const loadChart = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const chartData = await fetchPoolChart(poolId);
        setData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch chart"));
      } finally {
        setIsLoading(false);
      }
    };

    loadChart();
  }, [poolId]);

  return { data, isLoading, error };
}
