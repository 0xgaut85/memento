'use client';

/**
 * Analytics Page
 * Platform revenue and usage dashboard
 */

import { motion } from 'framer-motion';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GlassCard } from '@/components/ui/glass-card';
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
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-4">Analytics</h1>
          <GlassCard className="max-w-md mx-auto">
            <p className="text-sm text-red-600">
              Failed to load analytics data. Please try again later.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </GlassCard>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Platform revenue & usage</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-colors disabled:opacity-50"
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

        {/* Last Updated */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground"
        >
          Last updated: {new Date(stats.generatedAt).toLocaleString()}
        </motion.p>
      </div>
    </PageWrapper>
  );
}

