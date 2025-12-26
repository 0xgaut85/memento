'use client';

/**
 * Analytics Page
 * Premium platform revenue dashboard
 */

import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      {/* Subtle grain texture */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/transparentlogo.png"
              alt="Memento"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              memento.money
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/aggregator"
              className="px-5 py-2.5 bg-black text-white text-sm font-medium hover:bg-primary transition-colors"
            >
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">
              Platform Analytics
            </p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Revenue{' '}
              <span className="font-serif italic font-normal text-black/40">Dashboard</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto font-serif italic">
              Real-time insights into x402 payments and platform usage
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="mb-8">
            <StatsGrid stats={stats} />
          </div>

          {/* Activity & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
            className="mt-16 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(stats.generatedAt).toLocaleString()}
            </p>
            <div className="mt-6 flex items-center justify-center gap-6">
              <a
                href="https://www.x402scan.com/server/e967cd67-2d0c-47dc-966c-2de04d17fa29"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Image src="/x402.svg" alt="x402" width={16} height={16} className="w-4 h-4" />
                View on x402scan
              </a>
              <span className="text-muted-foreground/30">•</span>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                memento.money
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
