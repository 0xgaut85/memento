'use client';

/**
 * usePlatformStats Hook
 * Fetches platform statistics from x402 server
 */

import { useQuery } from '@tanstack/react-query';
import type { PlatformStats } from './types';

const X402_SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'https://x402.memento.money';

async function fetchPlatformStats(): Promise<PlatformStats> {
  const response = await fetch(`${X402_SERVER_URL}/api/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch platform stats');
  }
  return response.json();
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: fetchPlatformStats,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });
}

