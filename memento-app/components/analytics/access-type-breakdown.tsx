'use client';

/**
 * AccessTypeBreakdown Component
 * Premium breakdown of payments by access type
 */

import { motion } from 'framer-motion';
import type { PlatformStats } from './types';

interface AccessTypeBreakdownProps {
  breakdown: PlatformStats['breakdown'];
}

export function AccessTypeBreakdown({ breakdown }: AccessTypeBreakdownProps) {
  const { byAccessType } = breakdown;
  
  const totalCount = byAccessType.reduce((sum, t) => sum + t.count, 0);

  const getLabel = (type: string) => {
    return type === 'agent' ? 'AI Agents' : 'Humans';
  };

  const getDescription = (type: string) => {
    return type === 'agent' ? 'programmatic access' : 'dashboard users';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white/60 backdrop-blur-sm border border-white/40 p-8"
    >
      <p className="text-xs font-medium tracking-[0.2em] uppercase text-foreground/40 mb-6">
        Access Types
      </p>
      
      {byAccessType.length === 0 ? (
        <p className="text-foreground/40 font-serif italic py-8 text-center">
          No payments recorded yet
        </p>
      ) : (
        <div className="space-y-6">
          {byAccessType.map((item) => {
            const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
            
            return (
              <div key={item.type}>
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-lg font-medium">{getLabel(item.type)}</span>
                    <span className="text-sm text-foreground/40 ml-2 font-serif italic">
                      {getDescription(item.type)}
                    </span>
                  </div>
                  <span className="text-sm text-foreground/60">
                    {item.count} <span className="text-foreground/30">({percentage.toFixed(0)}%)</span>
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="h-1 bg-foreground/5 overflow-hidden">
                  <motion.div
                    className={`h-full ${item.type === 'agent' ? 'bg-foreground/20' : 'bg-primary/60'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                </div>
                
                <p className="text-right text-sm text-foreground/50 mt-2">
                  ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
