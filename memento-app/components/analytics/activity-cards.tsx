'use client';

/**
 * ActivityCards Component
 * Displays activity breakdown by time period
 */

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import type { PlatformStats } from './types';

interface ActivityCardsProps {
  activity: PlatformStats['activity'];
}

export function ActivityCards({ activity }: ActivityCardsProps) {
  const periods = [
    { label: 'Last 24 Hours', payments: activity.payments24h, revenue: activity.revenue24h },
    { label: 'Last 7 Days', payments: activity.payments7d, revenue: activity.revenue7d },
    { label: 'Last 30 Days', payments: activity.payments30d, revenue: activity.revenue30d },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <GlassCard>
        <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {periods.map((period, i) => (
            <div key={period.label} className="text-center p-4 rounded-xl bg-white/30">
              <p className="text-sm text-muted-foreground mb-2">{period.label}</p>
              <p className="text-2xl font-bold">{period.payments}</p>
              <p className="text-sm text-muted-foreground">payments</p>
              <p className="text-lg font-semibold text-primary mt-2">
                ${period.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

