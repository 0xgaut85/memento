import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, options?: {
  decimals?: number;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
}): string {
  const { decimals = 2, prefix = "", suffix = "", compact = false } = options || {};
  
  if (compact) {
    if (num >= 1e9) {
      return `${prefix}${(num / 1e9).toFixed(decimals)}B${suffix}`;
    }
    if (num >= 1e6) {
      return `${prefix}${(num / 1e6).toFixed(decimals)}M${suffix}`;
    }
    if (num >= 1e3) {
      return `${prefix}${(num / 1e3).toFixed(decimals)}K${suffix}`;
    }
  }
  
  return `${prefix}${num.toFixed(decimals)}${suffix}`;
}

export function formatPercent(num: number, decimals = 2): string {
  return `${num.toFixed(decimals)}%`;
}

export function formatUSD(num: number, compact = true): string {
  return formatNumber(num, { prefix: "$", compact });
}

