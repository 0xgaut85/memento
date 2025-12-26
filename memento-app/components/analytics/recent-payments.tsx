'use client';

/**
 * RecentPayments Component
 * Shows a list of recent x402 payments
 */

import { motion } from 'framer-motion';
import { ExternalLink, User, Bot } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { PlatformStats } from './types';

interface RecentPaymentsProps {
  payments: PlatformStats['recentPayments'];
}

function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Payments</h3>
          <span className="text-sm text-muted-foreground">Last 10</span>
        </div>
        
        {payments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No payments yet</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment, i) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${payment.type === 'agent' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {payment.type === 'agent' ? (
                      <Bot className="w-4 h-4 text-blue-600" />
                    ) : (
                      <User className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <a
                      href={`https://solscan.io/account/${payment.payer}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {formatAddress(payment.payer)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-xs text-muted-foreground capitalize">{payment.type} access</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(payment.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

