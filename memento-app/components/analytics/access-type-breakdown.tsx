'use client';

/**
 * AccessTypeBreakdown Component
 * Shows breakdown of payments by access type (human vs agent)
 */

import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { PlatformStats } from './types';

interface AccessTypeBreakdownProps {
  breakdown: PlatformStats['breakdown'];
}

export function AccessTypeBreakdown({ breakdown }: AccessTypeBreakdownProps) {
  const { byAccessType } = breakdown;
  
  const totalCount = byAccessType.reduce((sum, t) => sum + t.count, 0);
  const totalRevenue = byAccessType.reduce((sum, t) => sum + t.revenue, 0);

  const getIcon = (type: string) => {
    return type === 'agent' ? Bot : User;
  };

  const getLabel = (type: string) => {
    return type === 'agent' ? 'AI Agents' : 'Human Users';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <GlassCard>
        <h3 className="text-lg font-semibold mb-4">Access Type Breakdown</h3>
        {byAccessType.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No payments yet</p>
        ) : (
          <div className="space-y-4">
            {byAccessType.map((item) => {
              const Icon = getIcon(item.type);
              const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
              
              return (
                <div key={item.type} className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{getLabel(item.type)}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} revenue
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

