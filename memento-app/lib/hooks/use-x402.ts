'use client';

/**
 * useX402 Hook - x402 payment integration
 * Uses native Solana Wallet Adapter for transaction signing
 * Reown handles the connection UI, native adapter handles signing
 */

import { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppKitAccount } from '@reown/appkit/react';
import { createX402Client } from '@payai/x402-solana/client';

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
  // Native Solana wallet adapter - for transaction signing
  const wallet = useWallet();
  
  // Reown Solana account - for connection state
  const solanaAccount = useAppKitAccount({ namespace: 'solana' });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefer native adapter (has signTransaction), fallback to Reown for display
  const isConnected = wallet.connected || solanaAccount.isConnected;
  const address = wallet.publicKey?.toString() || solanaAccount.address;

  // Create x402 client - requires native wallet adapter with signTransaction
  const x402Client = useMemo(() => {
    // x402-solana requires native wallet adapter with signTransaction
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      return null;
    }

    // Create x402 client exactly as shown in docs
    return createX402Client({
      wallet: {
        address: wallet.publicKey.toString(),
        signTransaction: async (tx) => {
          if (!wallet.signTransaction) {
            throw new Error('Wallet does not support signing');
          }
          return await wallet.signTransaction(tx);
        },
      },
      network: 'solana', // mainnet - simple format auto-converts to CAIP-2
      amount: BigInt(10_000_000), // max 10 USDC safety limit
    });
  }, [wallet.connected, wallet.publicKey, wallet.signTransaction]);

  // Check if user has active access
  const checkAccess = useCallback(async (): Promise<AccessCheckResponse> => {
    if (!address) {
      return { hasAccess: false };
    }

    try {
      const response = await fetch(
        `${X402_SERVER_URL}/api/access/check?userAddress=${address}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check access');
      }
      
      return await response.json();
    } catch (err) {
      console.error('[useX402] Check access error:', err);
      return { hasAccess: false };
    }
  }, [address]);

  // Request access (triggers x402 payment flow)
  const requestAccess = useCallback(async (accessType: 'human' | 'agent' = 'human'): Promise<PaymentResponse> => {
    if (!x402Client || !address) {
      const errorMsg = !wallet.connected 
        ? 'Please connect your Solana wallet first.'
        : 'Wallet not ready for payments. Please reconnect.';
      setError(errorMsg);
      return { success: false, accessGranted: false, error: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Make paid request - automatically handles 402 payments
      const response = await x402Client.fetch(`${X402_SERVER_URL}/aggregator/solana`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
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
  }, [x402Client, address, wallet.connected]);

  return {
    checkAccess,
    requestAccess,
    isLoading,
    error,
    isConnected,
    publicKey: address,
  };
}
