'use client';

/**
 * StatCard Component
 * Premium stat display with elegant typography
 */

import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  format?: 'number' | 'currency' | 'percentage';
  delay?: number;
  accent?: boolean;
}

export function StatCard({
  label,
  value,
  sublabel,
  format = 'number',
  delay = 0,
  accent = false,
}: StatCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('en-US');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div className="relative p-6 bg-white/60 backdrop-blur-sm border border-white/40 hover:border-white/60 transition-all duration-300">
        {/* Subtle corner accent */}
        {accent && (
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent" />
        )}
        
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-foreground/40 mb-3">
          {label}
        </p>
        <p className={`text-4xl md:text-5xl font-light tracking-tight ${accent ? 'text-primary' : 'text-foreground'}`}>
          {formatValue(value)}
        </p>
        {sublabel && (
          <p className="text-sm text-foreground/50 mt-2 font-serif italic">
            {sublabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}
