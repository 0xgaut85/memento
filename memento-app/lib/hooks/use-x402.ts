'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createX402Client } from 'x402-solana/client';

// x402 Server URL
const X402_SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'https://x402.memento.money';

// Access check response
interface AccessCheckResponse {
  hasAccess: boolean;
  expiresAt?: string;
  remainingHours?: number;
}

// Payment response
interface PaymentResponse {
  success: boolean;
  accessGranted: boolean;
  expiresAt?: string;
  message?: string;
  error?: string;
  pools?: {
    safe: Array<{
      pool: string;
      chain: string;
      project: string;
      symbol: string;
      tvlUsd: number;
      apy: number;
    }>;
    degen: Array<{
      pool: string;
      chain: string;
      project: string;
      symbol: string;
      tvlUsd: number;
      apy: number;
    }>;
  };
}

export function useX402() {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has active access
  const checkAccess = useCallback(async (): Promise<AccessCheckResponse> => {
    if (!wallet.publicKey) {
      return { hasAccess: false };
    }

    try {
      const response = await fetch(
        `${X402_SERVER_URL}/api/access/check?userAddress=${wallet.publicKey.toString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check access');
      }
      
      return await response.json();
    } catch (err) {
      console.error('[useX402] Check access error:', err);
      return { hasAccess: false };
    }
  }, [wallet.publicKey]);

  // Request access (triggers x402 payment flow)
  const requestAccess = useCallback(async (accessType: 'human' | 'agent' = 'human'): Promise<PaymentResponse> => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      setError('Wallet not connected or does not support signing');
      return { success: false, accessGranted: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create x402 client with Solana wallet adapter
      // Per x402-solana docs: https://www.npmjs.com/package/x402-solana
      const client = createX402Client({
        wallet: {
          address: wallet.publicKey.toString(),
          signTransaction: async (tx) => {
            if (!wallet.signTransaction) {
              throw new Error('Wallet does not support signing');
            }
            return await wallet.signTransaction(tx);
          },
        },
        network: process.env.NODE_ENV === 'development' ? 'solana-devnet' : 'solana',
        maxPaymentAmount: BigInt(10_000_000), // Max $10 USDC safety limit
      });

      // Make paid request to aggregator endpoint
      // x402 client automatically handles 402 Payment Required and payment flow
      const response = await client.fetch(`${X402_SERVER_URL}/aggregator/solana`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: wallet.publicKey.toString(),
          accessType,
        }),
      });

      const result: PaymentResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      console.error('[useX402] Request access error:', err);
      setError(errorMessage);
      return { success: false, accessGranted: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  return {
    checkAccess,
    requestAccess,
    isLoading,
    error,
    isConnected: wallet.connected,
    publicKey: wallet.publicKey?.toString(),
  };
}





