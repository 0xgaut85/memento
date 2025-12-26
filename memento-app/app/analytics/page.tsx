'use client';

/**
 * Analytics Page
 * Premium platform revenue dashboard
 */

import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
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
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-8 h-8 text-primary" />
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
            <h1 className="text-2xl font-bold mb-4">Failed to load analytics</h1>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
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
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="text-sm font-medium text-primary tracking-wide uppercase mb-1">
              Platform Analytics
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Revenue{' '}
              <span className="font-serif italic font-normal text-black/40">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-serif italic">
              Real-time insights into x402 payments and platform usage
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-colors disabled:opacity-50 self-start"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </motion.div>

        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        {/* Activity & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          className="pt-8 text-center border-t border-border/30"
        >
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(stats.generatedAt).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <a
              href="https://www.x402scan.com/server/e967cd67-2d0c-47dc-966c-2de04d17fa29"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Image src="/x402.svg" alt="x402" width={16} height={16} className="w-4 h-4" />
              View on x402scan
            </a>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
