'use client';

import { useState, useCallback } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-solana/react';
import { createX402Client } from 'x402-solana/client';
import type { VersionedTransaction } from '@solana/web3.js';
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
  // Use Reown AppKit for Solana wallet - doesn't modify transactions like native Phantom adapter
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
      setError('Wallet not connected. Please connect with Phantom or Solflare.');
      return { success: false, accessGranted: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const addressShort = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : null;

      // #region agent log (x402 debug)
      fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run3-reown',hypothesisId:'REOWN',location:'use-x402.ts:requestAccess:entry',message:'requestAccess called with REOWN provider',data:{isConnected,addressShort,hasWalletProvider:!!walletProvider},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      // Create x402 client with Reown's Solana provider
      // Reown provider passes transactions directly without modification
      const client = createX402Client({
        wallet: {
          address: address,
          publicKey: new PublicKey(address),
          signTransaction: async (tx: VersionedTransaction): Promise<VersionedTransaction> => {
            // Log before signing
            const getIxCount = (t: VersionedTransaction) => {
              try {
                const msg: any = (t as any).message;
                return (msg?.compiledInstructions ?? msg?.instructions ?? []).length;
              } catch { return null; }
            };

            const beforeCount = getIxCount(tx);
            // #region agent log (x402 debug)
            fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run3-reown',hypothesisId:'REOWN',location:'use-x402.ts:signTransaction:before',message:'tx BEFORE Reown signTransaction',data:{addressShort,ixCount:beforeCount},timestamp:Date.now()})}).catch(()=>{});
            // #endregion

            // Use Reown's wallet provider to sign
            const signedTx = await walletProvider.signTransaction(tx);
            
            const afterCount = getIxCount(signedTx as VersionedTransaction);
            // #region agent log (x402 debug)
            fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run3-reown',hypothesisId:'REOWN',location:'use-x402.ts:signTransaction:after',message:'tx AFTER Reown signTransaction',data:{addressShort,ixCountBefore:beforeCount,ixCountAfter:afterCount,ixCountChanged:beforeCount!==afterCount},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            
            return signedTx as VersionedTransaction;
          },
        },
        network: 'solana',
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

      // #region agent log (x402 debug)
      fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run3-reown',hypothesisId:'REOWN',location:'use-x402.ts:requestAccess:response',message:'client.fetch response received',data:{status:response.status,ok:response.ok,error:result?.error??null,accessGranted:result?.accessGranted??null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      console.error('[useX402] Request access error:', err);
      setError(errorMessage);
      // #region agent log (x402 debug)
      fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run3-reown',hypothesisId:'REOWN',location:'use-x402.ts:requestAccess:catch',message:'requestAccess threw',data:{error:errorMessage},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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
