"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, Loader2 } from "lucide-react";
import { Pool, PoolChartData } from "@/types/pool";
import { GlassCard } from "@/components/ui/glass-card";
import { SparklineChart } from "@/components/ui/sparkline-chart";
import { getProtocolLogo, stringToColor, getChainColor, getChainLogo, getStablecoinLogo, cleanProtocolName } from "@/lib/protocol-logos";
import { fetchPoolChart, getPoolUrl } from "@/lib/api/defillama";

interface OpportunityCardProps {
  pool: Pool;
  index?: number;
  rank?: number; // 1, 2, 3 for gold, silver, bronze
}

type TimeRange = "7d" | "30d" | "1y";

// Rank border styles
const rankStyles: Record<number, { border: string; shadow: string }> = {
  1: { border: "border-2 border-yellow-400", shadow: "shadow-[0_0_20px_rgba(250,204,21,0.4)]" }, // Gold
  2: { border: "border-2 border-gray-400", shadow: "shadow-[0_0_20px_rgba(156,163,175,0.4)]" }, // Silver
  3: { border: "border-2 border-amber-600", shadow: "shadow-[0_0_20px_rgba(217,119,6,0.4)]" }, // Bronze
};

export function OpportunityCard({ pool, index = 0, rank }: OpportunityCardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [chartData, setChartData] = useState<PoolChartData[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [hasLoadedChart, setHasLoadedChart] = useState(false);

  const protocolLogo = getProtocolLogo(pool.project);
  const fallbackColor = stringToColor(pool.project);
  const chainColor = getChainColor(pool.chain);
  const chainLogo = getChainLogo(pool.chain);
  const stablecoinLogo = getStablecoinLogo(pool.symbol);
  const poolUrl = getPoolUrl(pool);
  const displayName = cleanProtocolName(pool.project);

  // Check if this is a Jupiter Lend pool (no historical data available)
  const isJupiterLend = pool.pool.startsWith("jupiter-lend-");

  // Load chart data on mount (lazy load)
  useEffect(() => {
    if (hasLoadedChart) return;

    const loadChart = async () => {
      setIsLoadingChart(true);
      try {
        // Jupiter Lend doesn't have historical data API, so create flat line with current values
        if (isJupiterLend) {
          const now = new Date();
          // Generate 30 data points with current values (flat line)
          const flatData: PoolChartData[] = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (29 - i));
            return {
              timestamp: date.toISOString(),
              tvlUsd: pool.tvlUsd,
              apy: pool.apy,
              apyBase: pool.apyBase,
              apyReward: pool.apyReward,
            };
          });
          setChartData(flatData);
        } else {
          const data = await fetchPoolChart(pool.pool);
          setChartData(data);
        }
      } catch (err) {
        console.error("Failed to load chart:", err);
      } finally {
        setIsLoadingChart(false);
        setHasLoadedChart(true);
      }
    };

    // Delay loading to stagger requests
    const timeout = setTimeout(loadChart, index * 100);
    return () => clearTimeout(timeout);
  }, [pool.pool, pool.apy, pool.tvlUsd, pool.apyBase, pool.apyReward, index, hasLoadedChart, isJupiterLend]);

  // Format numbers
  const formatAPY = (apy: number) => `${apy.toFixed(2)}%`;
  const formatTVL = (tvl: number) => {
    if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
    if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
    return `$${(tvl / 1_000).toFixed(0)}K`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <GlassCard 
        hover 
        padding="none" 
        className={`h-full overflow-hidden group rounded-2xl ${rank && rankStyles[rank] ? `${rankStyles[rank].border} ${rankStyles[rank].shadow}` : ""}`}
      >
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Protocol info */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Logo */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: protocolLogo ? "transparent" : fallbackColor }}
              >
                {protocolLogo ? (
                  <Image
                    src={protocolLogo}
                    alt={pool.project}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {pool.project.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name & symbol */}
              <div className="min-w-0">
                <h3 className="text-xl font-bold truncate">{displayName}</h3>
                <div className="flex items-center gap-1.5">
                  {stablecoinLogo && (
                    <Image
                      src={stablecoinLogo}
                      alt={pool.symbol}
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  )}
                  <p className="text-sm text-muted-foreground font-mono truncate">
                    {pool.symbol}
                  </p>
                </div>
              </div>
            </div>

            {/* Chain badge with logo */}
            <div
              className="px-2.5 py-1 rounded-full text-xs font-medium text-white flex-shrink-0 flex items-center gap-1.5"
              style={{ backgroundColor: chainColor }}
            >
              {chainLogo && (
                <Image
                  src={chainLogo}
                  alt={pool.chain}
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
              )}
              {pool.chain}
            </div>
          </div>

          {/* APY & TVL */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">APY</p>
              <div className="flex items-center gap-1.5">
                <span className="text-3xl font-bold text-emerald-500">
                  {formatAPY(pool.apy)}
                </span>
                {pool.apyPct1D && pool.apyPct1D > 0 && (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">TVL</p>
              <span className="text-3xl font-bold">{formatTVL(pool.tvlUsd)}</span>
            </div>
          </div>
        </div>

        {/* Charts section */}
        <div className="px-5 pb-4">
          {/* Time range selector */}
          <div className="flex items-center gap-1 mb-3">
            {(["7d", "30d", "1y"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Charts */}
          {isLoadingChart ? (
            <div className="h-[120px] flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* APY Chart */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  APY History
                </p>
                <SparklineChart
                  data={chartData}
                  dataKey="apy"
                  color="#10B981"
                  timeRange={timeRange}
                  height={50}
                />
              </div>

              {/* TVL Chart */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  TVL History
                </p>
                <SparklineChart
                  data={chartData}
                  dataKey="tvlUsd"
                  color="#3B82F6"
                  timeRange={timeRange}
                  height={50}
                />
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="p-5 pt-0">
          <a
            href={poolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:opacity-90 transition-opacity group-hover:gap-3"
          >
            Stake on {displayName}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </GlassCard>
    </motion.div>
  );
}

