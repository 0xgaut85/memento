/**
 * Analytics Types
 * Type definitions for platform statistics
 */

export interface PlatformStats {
  overview: {
    totalUsers: number;
    totalPayments: number;
    totalRevenue: number;
    activeAccess: number;
    pricePerAccess: number;
  };
  activity: {
    payments24h: number;
    payments7d: number;
    payments30d: number;
    revenue24h: number;
    revenue7d: number;
    revenue30d: number;
  };
  breakdown: {
    byAccessType: Array<{
      type: string;
      count: number;
      revenue: number;
    }>;
  };
  recentPayments: Array<{
    id: string;
    amount: number;
    type: string;
    service: string;
    payer: string;
    timestamp: string;
  }>;
  generatedAt: string;
}

