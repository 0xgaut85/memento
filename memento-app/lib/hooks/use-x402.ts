'use client';

import { useState, useCallback } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-solana/react';
import { createX402Client } from 'x402-solana/client';
import { PublicKey } from '@solana/web3.js';

// x402 Server URL
const X402_SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'https://x402.memento.money';

// Solana RPC URL (Helius for reliability)
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

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
  // Use Reown AppKit hooks for Solana wallet
  // Per Reown docs: https://docs.reown.com/appkit/react/core/hooks
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!isConnected || !address || !walletProvider) {
      setError('Wallet not connected');
      return { success: false, accessGranted: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create x402 client with Reown Solana wallet provider
      // Per x402-solana docs: https://www.npmjs.com/package/x402-solana
      // Must include publicKey as PublicKey object for transaction construction
      const client = createX402Client({
        wallet: {
          address: address,
          publicKey: new PublicKey(address),
          signTransaction: async (tx) => {
            // Use Reown's wallet provider to sign
            // Per Reown Solana adapter docs
            if (!walletProvider?.signTransaction) {
              throw new Error('Wallet does not support signing');
            }
            return await walletProvider.signTransaction(tx);
          },
        },
        network: process.env.NODE_ENV === 'development' ? 'solana-devnet' : 'solana',
        rpcUrl: SOLANA_RPC_URL,
        maxPaymentAmount: BigInt(10_000_000), // Max $10 USDC safety limit
      });

      // Make paid request to aggregator endpoint
      // x402 client automatically handles 402 Payment Required and payment flow
      const response = await client.fetch(`${X402_SERVER_URL}/aggregator/solana`, {
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
  }, [isConnected, address, walletProvider]);

  return {
    checkAccess,
    requestAccess,
    isLoading,
    error,
    isConnected,
    publicKey: address,
  };
}
