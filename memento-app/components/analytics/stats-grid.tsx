'use client';

/**
 * StatsGrid Component
 * Displays overview statistics in a responsive grid
 */

import { Users, CreditCard, DollarSign, Zap } from 'lucide-react';
import { StatCard } from './stat-card';
import type { PlatformStats } from './types';

interface StatsGridProps {
  stats: PlatformStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const { overview, activity } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Users"
        value={overview.totalUsers}
        icon={Users}
        delay={0}
      />
      <StatCard
        label="Total Payments"
        value={overview.totalPayments}
        icon={CreditCard}
        trend={activity.payments24h > 0 ? { value: activity.payments24h, label: 'today' } : undefined}
        delay={0.1}
      />
      <StatCard
        label="Total Revenue"
        value={overview.totalRevenue}
        icon={DollarSign}
        format="currency"
        delay={0.2}
      />
      <StatCard
        label="Active Access"
        value={overview.activeAccess}
        icon={Zap}
        delay={0.3}
      />
    </div>
  );
}

