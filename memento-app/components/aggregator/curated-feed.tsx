"use client";

import { motion } from "framer-motion";
import { Sparkles, ExternalLink, TrendingUp, DollarSign, Star } from "lucide-react";
import { Pool } from "@/types/pool";
import { GlassCard } from "@/components/ui/glass-card";
import { ChainBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { formatUSD, formatPercent, cn } from "@/lib/utils";

interface CuratedFeedProps {
  pools: Pool[];
  isLoading?: boolean;
  className?: string;
}

export function CuratedFeed({ pools, isLoading, className }: CuratedFeedProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[300px] p-4 rounded-2xl bg-white/60 border border-white/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-10 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pools.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-5", className)}>
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Top Stablecoin Yields
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
          <p className="text-sm text-muted-foreground">
            Highest APY pools with $250k+ liquidity
          </p>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div className="relative -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {pools.map((pool, index) => (
            <motion.div
              key={pool.pool}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex-shrink-0 w-[300px] snap-start"
            >
              <a
                href={pool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <GlassCard
                  hover
                  padding="none"
                  className="h-full relative overflow-hidden group"
                >
                  {/* Rank badge */}
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-xs font-bold text-white">
                      #{index + 1}
                    </span>
                  </div>

                  {/* APY Header */}
                  <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-emerald-600">
                        {formatPercent(pool.apy)}
                      </span>
                      <span className="text-sm text-muted-foreground">APY</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">
                        {formatUSD(pool.tvlUsd)} TVL
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Project info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 border border-purple-200/50">
                        <span className="text-base font-bold text-purple-600">
                          {pool.project.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">
                          {pool.project}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-mono">
                              {pool.symbol}
                            </span>
                          </div>
                          <ChainBadge chain={pool.chain} />
                        </div>
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors pt-2 border-t border-border/30">
                      <span>Deposit now</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </GlassCard>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
