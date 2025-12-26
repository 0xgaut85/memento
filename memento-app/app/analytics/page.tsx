'use client';

/**
 * Analytics Page
 * Premium platform revenue dashboard
 */

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import {
  usePlatformStats,
  StatsGrid,
  ActivityCards,
  AccessTypeBreakdown,
  RecentPayments,
} from '@/components/analytics';

export default function AnalyticsPage() {
  const { data: stats, isLoading, error, refetch, isFetching } = usePlatformStats();

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-foreground/60 font-serif italic">Loading analytics...</p>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !stats) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-light mb-4">Failed to load analytics</h1>
            <button
              onClick={() => refetch()}
              className="px-8 py-3 bg-foreground text-white text-sm font-medium tracking-wide hover:bg-primary transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-8 border-b border-foreground/10"
        >
          <div>
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">
              Platform Analytics
            </p>
            <h1 className="text-5xl md:text-6xl font-light tracking-tight leading-none">
              Revenue
              <span className="font-serif italic text-foreground/30 ml-3">Dashboard</span>
            </h1>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-sm text-foreground/60 hover:text-foreground transition-colors disabled:opacity-50 self-start sm:self-end pb-1 border-b border-transparent hover:border-foreground/30"
          >
            {isFetching ? 'Refreshing...' : 'Refresh data'}
          </button>
        </motion.div>

        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        {/* Activity & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ActivityCards activity={stats.activity} />
          <AccessTypeBreakdown breakdown={stats.breakdown} />
        </div>

        {/* Recent Payments */}
        <RecentPayments payments={stats.recentPayments} />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-12 text-center"
        >
          <p className="text-xs text-foreground/50 font-serif italic mb-6">
            Last updated {new Date(stats.generatedAt).toLocaleString()}
          </p>
          <a
            href="https://www.x402scan.com/server/e967cd67-2d0c-47dc-966c-2de04d17fa29"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-foreground/60 hover:text-foreground transition-colors"
          >
            <Image src="/x402.svg" alt="x402" width={14} height={14} className="opacity-70" />
            <span>View on x402scan</span>
          </a>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
