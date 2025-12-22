'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppKitAccount } from '@reown/appkit/react';
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
  // Native Solana wallet adapter (primary - best x402 compatibility)
  const { publicKey, signTransaction, connected } = useWallet();
  
  // Reown Solana account (fallback)
  const solanaAccount = useAppKitAccount({ namespace: 'solana' });
  
  // Prefer native adapter
  const isConnected = connected || solanaAccount.isConnected;
  const address = publicKey?.toBase58() || solanaAccount.address;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create x402 client - only works with native adapter (has signTransaction)
  const x402Client = useMemo((): X402Client | null => {
    // x402-solana requires native wallet adapter with signTransaction
    if (!connected || !publicKey || !signTransaction) {
      // #region agent log
      console.log('[DBG:x402] No native wallet adapter available', { 
        connected, 
        hasPublicKey: !!publicKey, 
        hasSignTx: !!signTransaction,
        reownConnected: solanaAccount.isConnected 
      });
      // #endregion
      return null;
    }
    
    // #region agent log
    console.log('[DBG:x402] Creating x402 client with native adapter', {
      publicKey: publicKey.toBase58(),
    });
    // #endregion
    
    try {
      const walletAdapter = {
        address: publicKey.toBase58(),
        publicKey: publicKey,
        signTransaction: async (tx: VersionedTransaction): Promise<VersionedTransaction> => {
          // #region agent log
          const ixCount = tx.message.compiledInstructions.length;
          console.log('[DBG:x402] Transaction BEFORE signing', { instructionCount: ixCount });
          // #endregion
          
          const signedTx = await signTransaction(tx);
          
          // #region agent log
          const signedIxCount = signedTx.message.compiledInstructions.length;
          console.log('[DBG:x402] Transaction AFTER signing', { 
            instructionCountBefore: ixCount,
            instructionCountAfter: signedIxCount 
          });
          // #endregion
          
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
  }, [connected, publicKey, signTransaction, solanaAccount.isConnected]);

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
      const errorMsg = !connected 
        ? 'Please connect your Solana wallet using the Phantom or Solflare option.'
        : 'Wallet not ready for payments. Please reconnect.';
      setError(errorMsg);
      return { success: false, accessGranted: false, error: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    // #region agent log
    console.log('[DBG:x402] Starting payment request', { address, accessType });
    // #endregion

    try {
      const response = await x402Client.fetch(`${X402_SERVER_URL}/aggregator/solana`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          accessType,
        }),
      });

      // #region agent log
      console.log('[DBG:x402] Payment response', { status: response.status, ok: response.ok });
      // #endregion

      const result: PaymentResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      
      // #region agent log
      console.log('[DBG:x402] Payment error', { error: errorMessage });
      // #endregion
      
      console.error('[useX402] Request access error:', err);
      setError(errorMessage);
      return { success: false, accessGranted: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [x402Client, address, connected]);

  return {
    checkAccess,
    requestAccess,
    isLoading,
    error,
    isConnected,
    publicKey: address,
  };
}
