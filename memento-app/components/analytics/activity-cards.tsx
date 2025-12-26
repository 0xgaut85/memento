'use client';

/**
 * ActivityCards Component
 * Premium activity breakdown with elegant typography
 */

import { motion } from 'framer-motion';
import type { PlatformStats } from './types';

interface ActivityCardsProps {
  activity: PlatformStats['activity'];
}

export function ActivityCards({ activity }: ActivityCardsProps) {
  const periods = [
    { 
      label: '24h', 
      fullLabel: 'Last 24 Hours',
      payments: activity.payments24h, 
      revenue: activity.revenue24h 
    },
    { 
      label: '7d', 
      fullLabel: 'Last 7 Days',
      payments: activity.payments7d, 
      revenue: activity.revenue7d 
    },
    { 
      label: '30d', 
      fullLabel: 'Last 30 Days',
      payments: activity.payments30d, 
      revenue: activity.revenue30d 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white/60 backdrop-blur-sm border border-white/40 p-8"
    >
      <p className="text-xs font-medium tracking-[0.2em] uppercase text-foreground/40 mb-6">
        Activity
      </p>
      
      <div className="space-y-6">
        {periods.map((period, i) => (
          <div key={period.label} className="group">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-foreground/60">{period.fullLabel}</span>
              <span className="text-2xl font-light tracking-tight">
                {period.payments}
                <span className="text-sm text-foreground/40 ml-1">payments</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 h-px bg-foreground/10 mr-4" />
              <span className="text-lg font-serif italic text-primary">
                ${period.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
