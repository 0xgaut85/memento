'use client';

/**
 * useX402 Hook - x402 payment integration
 * Exactly as per x402-solana README: https://github.com/PayAINetwork/x402-solana
 * 
 * Uses native Solana Wallet Adapter for wallet connection and transaction signing
 * 
 * Note: This hook requires WalletProvider context. Use within components that
 * are children of SolanaWalletProvider.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// x402 Server URL
const X402_SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'https://x402.memento.money';

// Helius RPC for mainnet
const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

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

// Default return value for SSR/no-context scenarios
const defaultReturn = {
  checkAccess: async () => ({ hasAccess: false }),
  requestAccess: async () => ({ success: false, accessGranted: false, error: 'Wallet not available' }),
  isLoading: false,
  error: null,
  isConnected: false,
  publicKey: undefined,
};

export function useX402() {
  // Track if we're on client side
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Native Solana wallet adapter - exactly as per x402-solana README
  const wallet = useWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connection state from native adapter (only after mount)
  const isConnected = mounted && wallet.connected;
  const address = mounted ? wallet.publicKey?.toString() : undefined;

  // Create x402 client factory - exactly as per x402-solana README
  const createX402ClientFactory = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      return null;
    }

    const { createX402Client } = await import('@payai/x402-solana/client');
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
      rpcUrl: HELIUS_RPC, // Use Helius RPC for reliable access
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
    if (!isConnected || !address) {
      const errorMsg = 'Please connect your Solana wallet first.';
      setError(errorMsg);
      return { success: false, accessGranted: false, error: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[x402 DEBUG] Starting payment flow', { address, accessType, serverUrl: X402_SERVER_URL });

      // Create the client dynamically
      const client = await createX402ClientFactory();
      
      if (!client) {
        throw new Error('Wallet not ready for payments. Please reconnect.');
      }

      console.log('[x402 DEBUG] Client created, making request to server');
      
      // Make a paid request - automatically handles 402 payments
      const response = await client.fetch(`${X402_SERVER_URL}/aggregator/solana`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          accessType,
        }),
      });

      console.log('[x402 DEBUG] Response received', { 
        status: response.status, 
        ok: response.ok,
        statusText: response.statusText
      });

      const result: PaymentResponse = await response.json();

      console.log('[x402 DEBUG] Response body', result);

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      return result;
    } catch (err) {
      console.error('[x402 DEBUG] Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });

      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      console.error('[useX402] Request access error:', err);
      setError(errorMessage);
      return { success: false, accessGranted: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, createX402ClientFactory]);

  return {
    checkAccess,
    requestAccess,
    isLoading,
    error,
    isConnected,
    publicKey: address,
  };
}
