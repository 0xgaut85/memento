"use client";

import { Pool } from "@/types/pool";
import { PoolRow } from "./pool-row";
import { PoolCard } from "./pool-card";
import { TableSkeleton, CardGridSkeleton } from "@/components/ui/loading-skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

interface PoolTableProps {
  pools: Pool[];
  isLoading?: boolean;
  className?: string;
}

export function PoolTable({ pools, isLoading, className }: PoolTableProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {/* Desktop skeleton */}
        <div className="hidden lg:block">
          <GlassCard padding="none">
            <TableSkeleton rows={10} />
          </GlassCard>
        </div>
        {/* Mobile skeleton */}
        <div className="lg:hidden">
          <CardGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <GlassCard className={cn("text-center py-16", className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">No pools found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={className}>
      {/* Desktop table */}
      <div className="hidden lg:block">
        <GlassCard padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Protocol
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Chain
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    APY
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    TVL
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    24h
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Outlook
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {pools.map((pool, index) => (
                  <PoolRow key={pool.pool} pool={pool} index={index} />
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pools.map((pool, index) => (
          <PoolCard key={pool.pool} pool={pool} index={index} />
        ))}
      </div>
    </div>
  );
}
