'use client';

/**
 * RecentPayments Component
 * Premium list of recent x402 payments
 */

import { motion } from 'framer-motion';
import type { PlatformStats } from './types';

interface RecentPaymentsProps {
  payments: PlatformStats['recentPayments'];
}

function formatAddress(address: string): string {
  return `${address.slice(0, 4)}...`;
}

function formatService(service: string): string {
  const services: Record<string, string> = {
    aggregator: 'Aggregator',
  };
  return services[service] || service;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white/60 backdrop-blur-sm border border-white/40 p-8"
    >
      <div className="flex items-baseline justify-between mb-6">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-foreground/40">
          Recent Payments
        </p>
        <span className="text-xs text-foreground/30 font-serif italic">last 10</span>
      </div>
      
      {payments.length === 0 ? (
        <p className="text-foreground/40 font-serif italic py-12 text-center">
          No payments recorded yet
        </p>
      ) : (
        <div className="space-y-0">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-foreground/10 text-xs text-foreground/40 uppercase tracking-wider">
            <div className="col-span-3">Wallet</div>
            <div className="col-span-3">Service</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Time</div>
          </div>
          
          {payments.map((payment, i) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + i * 0.03 }}
              className="grid grid-cols-12 gap-4 py-4 border-b border-foreground/5 hover:bg-white/30 transition-colors -mx-8 px-8"
            >
              <div className="col-span-3">
                <span className="font-mono text-sm text-foreground/70">
                  {formatAddress(payment.payer)}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-sm text-foreground/60">
                  {formatService(payment.service)}
                </span>
              </div>
              <div className="col-span-2">
                <span className={`text-xs px-2 py-1 ${
                  payment.type === 'agent' 
                    ? 'bg-foreground/5 text-foreground/50' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {payment.type}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="font-medium">${payment.amount.toFixed(2)}</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm text-foreground/40 font-serif italic">
                  {formatTime(payment.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
