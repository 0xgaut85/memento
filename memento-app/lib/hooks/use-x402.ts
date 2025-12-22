'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createX402Client } from 'x402-solana/client';
import type { VersionedTransaction } from '@solana/web3.js';

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
  // Use native Solana wallet adapter for x402 payments
  // Native adapter doesn't modify transactions - required for x402 compatibility
  const { publicKey, signTransaction, connected, wallet } = useWallet();
  
  const address = publicKey?.toBase58();
  const isConnected = connected && !!publicKey;
  
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
    if (!isConnected || !address || !publicKey || !signTransaction) {
      setError('Wallet not connected. Please connect with Phantom or Solflare.');
      return { success: false, accessGranted: false, error: 'Wallet not connected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const rpcHost = (() => {
        try {
          return new URL(SOLANA_RPC_URL).host;
        } catch {
          return null;
        }
      })();
      const x402Host = (() => {
        try {
          return new URL(X402_SERVER_URL).host;
        } catch {
          return null;
        }
      })();
      const walletName = wallet?.adapter?.name || null;
      const addressShort = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : null;

      // #region agent log (x402 debug)
      fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'D',location:'use-x402.ts:requestAccess:entry',message:'requestAccess called',data:{isConnected,walletName,addressShort,nodeEnv:process.env.NODE_ENV||null,x402Host,rpcHost,rpcHasApiKey:SOLANA_RPC_URL.includes('api-key=')},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      // Preflight: fetch payment requirements (402) for debugging
      // #region agent log (x402 debug)
      fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'A',location:'use-x402.ts:requestAccess:preflight:start',message:'preflight fetch for payment requirements',data:{x402Host,addressShort,accessType},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      try {
        const preflight = await fetch(`${X402_SERVER_URL}/aggregator/solana`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: address, accessType }),
        });
        const preflightJson: any = await preflight.json().catch(() => null);
        const accepts = Array.isArray(preflightJson?.accepts) ? preflightJson.accepts : [];
        const acceptsSummary = accepts.slice(0, 5).map((a: any) => ({
          scheme: a?.scheme ?? null,
          network: a?.network ?? null,
          amount: a?.amount ?? a?.maxAmountRequired ?? null,
          payToShort: typeof a?.payTo === 'string' ? `${a.payTo.slice(0, 4)}...${a.payTo.slice(-4)}` : null,
          assetShort: typeof a?.asset === 'string' ? `${a.asset.slice(0, 4)}...${a.asset.slice(-4)}` : null,
          hasFeePayer: !!a?.extra?.feePayer,
        }));

        // #region agent log (x402 debug)
        fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'A',location:'use-x402.ts:requestAccess:preflight:result',message:'preflight response summary',data:{status:preflight.status,x402Version:preflightJson?.x402Version??null,acceptsCount:accepts.length,acceptsSummary},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      } catch (e) {
        // #region agent log (x402 debug)
        fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'A',location:'use-x402.ts:requestAccess:preflight:error',message:'preflight failed',data:{error:e instanceof Error?e.message:String(e)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      }

      // Create x402 client with native Solana wallet adapter
      // Native adapter is required for x402 compatibility - doesn't modify transactions
      const client = createX402Client({
        wallet: {
          address: address,
          publicKey: publicKey,
          signTransaction: async (tx: VersionedTransaction): Promise<VersionedTransaction> => {
            const getIxMeta = (t: VersionedTransaction) => {
              try {
                const msg: any = (t as any).message;
                const compiled = (msg?.compiledInstructions ?? msg?.instructions ?? []) as any[];
                const keys = (msg?.staticAccountKeys ?? msg?.accountKeys ?? []) as any[];
                const programIds = compiled
                  .map((ix: any) => keys?.[ix?.programIdIndex])
                  .map((k: any) => (typeof k?.toBase58 === 'function' ? k.toBase58() : null))
                  .filter(Boolean) as string[];
                const counts = programIds.reduce(
                  (acc, pid) => {
                    if (pid.startsWith('ComputeBudget')) acc.computeBudget++;
                    else if (pid.startsWith('AToken')) acc.associatedToken++;
                    else if (pid.startsWith('Tokenkeg')) acc.token++;
                    else if (pid === '11111111111111111111111111111111') acc.system++;
                    else if (pid.startsWith('MemoSq')) acc.memo++;
                    else acc.other++;
                    return acc;
                  },
                  { computeBudget: 0, associatedToken: 0, token: 0, system: 0, memo: 0, other: 0 },
                );
                return {
                  ixCount: compiled.length,
                  addressTableLookups: Array.isArray(msg?.addressTableLookups) ? msg.addressTableLookups.length : null,
                  programCounts: counts,
                };
              } catch {
                return { ixCount: null, addressTableLookups: null, programCounts: null };
              }
            };

            const before = getIxMeta(tx);
            // #region agent log (x402 debug)
            fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'C',location:'use-x402.ts:signTransaction:before',message:'tx before wallet.signTransaction',data:{walletName,addressShort,meta:before},timestamp:Date.now()})}).catch(()=>{});
            // #endregion

            try {
              const signedTx = await signTransaction(tx);
              const after = getIxMeta(signedTx as VersionedTransaction);
              // #region agent log (x402 debug)
              fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'C',location:'use-x402.ts:signTransaction:after',message:'tx after wallet.signTransaction',data:{walletName,addressShort,meta:after,ixCountChanged:before?.ixCount!==after?.ixCount},timestamp:Date.now()})}).catch(()=>{});
              // #endregion
              return signedTx as VersionedTransaction;
            } catch (e) {
              // #region agent log (x402 debug)
              fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'C',location:'use-x402.ts:signTransaction:error',message:'wallet.signTransaction threw',data:{walletName,addressShort,error:e instanceof Error?e.message:String(e)},timestamp:Date.now()})}).catch(()=>{});
              // #endregion
              throw e;
            }
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

      // #region agent log (x402 debug)
      fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'B',location:'use-x402.ts:requestAccess:response',message:'client.fetch response received',data:{status:response.status,ok:response.ok,error:result?.error??null,accessGranted:result?.accessGranted??null},timestamp:Date.now()})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'B',location:'use-x402.ts:requestAccess:catch',message:'requestAccess threw',data:{error:errorMessage},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return { success: false, accessGranted: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, publicKey, signTransaction]);

  return {
    checkAccess,
    requestAccess,
    isLoading,
    error,
    isConnected,
    publicKey: address,
  };
}
