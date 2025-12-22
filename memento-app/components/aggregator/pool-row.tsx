"use client";

import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { Pool } from "@/types/pool";
import { ChainBadge, PredictionBadge } from "@/components/ui/badge";
import { formatUSD, formatPercent, cn } from "@/lib/utils";

interface PoolRowProps {
  pool: Pool;
  index?: number;
}

export function PoolRow({ pool, index = 0 }: PoolRowProps) {
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
  const apyTextClass = {
    high: "text-emerald-600",
    medium: "text-purple-600",
    low: "text-foreground",
  }[apyTier];

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.015 }}
      className="group hover:bg-white/60 transition-colors cursor-pointer"
      onClick={() => window.open(pool.url, "_blank")}
    >
      {/* Project */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 border border-purple-200/50">
            <span className="text-xs font-bold text-purple-600">
              {pool.project.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{pool.project}</p>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-mono">
                {pool.symbol}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Chain */}
      <td className="px-4 py-4">
        <ChainBadge chain={pool.chain} />
      </td>

      {/* APY */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className={cn("font-bold text-lg", apyTextClass)}>
            {formatPercent(pool.apy)}
          </span>
          <TrendIcon className={cn("w-4 h-4", trendColor)} />
        </div>
        {pool.apyBase !== null && (
          <p className="text-xs text-muted-foreground">
            {formatPercent(pool.apyBase)} base
            {pool.apyReward !== null && pool.apyReward > 0 && ` + ${formatPercent(pool.apyReward)}`}
          </p>
        )}
      </td>

      {/* TVL */}
      <td className="px-4 py-4">
        <span className="font-medium">{formatUSD(pool.tvlUsd)}</span>
      </td>

      {/* 24h Change */}
      <td className="px-4 py-4">
        <span className={cn("font-medium", trendColor)}>
          {apyChange > 0 ? "+" : ""}
          {formatPercent(apyChange)}
        </span>
      </td>

      {/* Prediction */}
      <td className="px-4 py-4">
        <PredictionBadge prediction={pool.predictions?.predictedClass} />
      </td>

      {/* Action */}
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-primary transition-colors">
          Open
          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </td>
    </motion.tr>
  );
}
