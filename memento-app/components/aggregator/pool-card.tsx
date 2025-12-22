"use client";

import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { Pool } from "@/types/pool";
import { GlassCard } from "@/components/ui/glass-card";
import { ChainBadge, PredictionBadge } from "@/components/ui/badge";
import { GlassButton } from "@/components/ui/glass-button";
import { formatUSD, formatPercent, cn } from "@/lib/utils";

interface PoolCardProps {
  pool: Pool;
  index?: number;
}

export function PoolCard({ pool, index = 0 }: PoolCardProps) {
  const apyChange = pool.apyPct1D ?? 0;
  const TrendIcon =
    apyChange > 0.1
      ? TrendingUp
      : apyChange < -0.1
      ? TrendingDown
      : Minus;
  const trendColor =
    apyChange > 0.1
      ? "text-emerald-500"
      : apyChange < -0.1
      ? "text-red-500"
      : "text-muted-foreground";

  // Determine APY tier for visual emphasis
  const apyTier = pool.apy >= 15 ? "high" : pool.apy >= 8 ? "medium" : "low";
  const apyBgClass = {
    high: "from-emerald-500/10 to-emerald-500/5",
    medium: "from-purple-500/10 to-purple-500/5", 
    low: "from-muted/50 to-muted/30",
  }[apyTier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <a
        href={pool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        <GlassCard hover padding="none" className="h-full overflow-hidden group">
          {/* APY Header Banner */}
          <div className={cn("px-4 py-3 bg-gradient-to-r", apyBgClass)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gradient-purple">
                  {formatPercent(pool.apy)}
                </span>
                <TrendIcon className={cn("w-4 h-4", trendColor)} />
              </div>
              <ChainBadge chain={pool.chain} />
            </div>
            {pool.apyBase !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatPercent(pool.apyBase)} base
                {pool.apyReward !== null && pool.apyReward > 0 && ` + ${formatPercent(pool.apyReward)} rewards`}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Project info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 border border-purple-200/50">
                <span className="text-sm font-bold text-purple-600">
                  {pool.project.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">
                  {pool.project}
                </p>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-mono">
                    {pool.symbol}
                  </span>
                </div>
              </div>
            </div>

            {/* TVL */}
            <div className="flex items-center justify-between py-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground">Total Value Locked</span>
              <span className="font-semibold">{formatUSD(pool.tvlUsd)}</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <PredictionBadge prediction={pool.predictions?.predictedClass} />
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Open
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </GlassCard>
      </a>
    </motion.div>
  );
}
