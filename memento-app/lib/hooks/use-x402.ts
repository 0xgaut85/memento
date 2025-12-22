'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createX402Client, X402Client } from 'x402-solana/client';
import type { VersionedTransaction } from '@solana/web3.js';

// x402 Server URL
const X402_SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'https://x402.memento.money';

// Solana RPC URL
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
  // Use official Solana wallet adapter as per x402-solana docs
  const { publicKey, signTransaction, connected } = useWallet();
  
  const address = publicKey?.toBase58();
  const isConnected = connected && !!publicKey;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create x402 client exactly as nolimit does - using useMemo for stability
  const x402Client = useMemo((): X402Client | null => {
    if (!isConnected || !publicKey || !signTransaction) {
      return null;
    }
    
    try {
      const walletAdapter = {
        address: publicKey.toBase58(),
        publicKey: publicKey,
        signTransaction: async (tx: VersionedTransaction): Promise<VersionedTransaction> => {
          const signedTx = await signTransaction(tx);
          return signedTx as VersionedTransaction;
        },
      };
      
      return createX402Client({
        wallet: walletAdapter,
        network: 'solana',
        rpcUrl: SOLANA_RPC_URL,
        maxPaymentAmount: BigInt(10_000_000), // max 10 USDC
      });
    } catch (err) {
      console.error('[useX402] Failed to create x402 client:', err);
      return null;
    }
  }, [isConnected, publicKey, signTransaction]);

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
      setError('Wallet not connected. Please connect with Phantom or Solflare.');
      return { success: false, accessGranted: false, error: 'Wallet not connected' };
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
  }, [x402Client, address]);

  return {
    checkAccess,
    requestAccess,
    isLoading,
    error,
    isConnected,
    publicKey: address,
  };
}
