'use client';

/**
 * StatsGrid Component
 * Premium overview statistics grid
 */

import { StatCard } from './stat-card';
import type { PlatformStats } from './types';

interface StatsGridProps {
  stats: PlatformStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const { overview, activity } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/5">
      <StatCard
        label="Total Users"
        value={overview.totalUsers}
        sublabel="registered wallets"
        delay={0}
      />
      <StatCard
        label="Payments"
        value={overview.totalPayments}
        sublabel={activity.payments24h > 0 ? `+${activity.payments24h} today` : 'all time'}
        delay={0.1}
      />
      <StatCard
        label="Revenue"
        value={overview.totalRevenue}
        format="currency"
        sublabel="total earned"
        delay={0.2}
        accent
      />
      <StatCard
        label="Active Access"
        value={overview.activeAccess}
        sublabel="current subscriptions"
        delay={0.3}
      />
    </div>
  );
}
