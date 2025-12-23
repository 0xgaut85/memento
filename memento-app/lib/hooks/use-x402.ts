'use client';

/**
 * useX402 Hook - x402 payment integration
 * EXACTLY as per x402-solana README: https://github.com/PayAINetwork/x402-solana
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const X402_SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'https://x402.memento.money';

// Helius RPC for mainnet - avoids rate limits on public RPC
const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

// NDJSON debug ingest endpoint (local)
const DEBUG_INGEST_ENDPOINT =
  'http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337';

// Proxy fetch to bypass CORS - as per README
function createProxyFetch(debug: { enabled: boolean; runId: string }): typeof fetch {
  let seq = 0;
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const targetUrl = typeof input === 'string' ? input : input.toString();
    const callId = ++seq;
    
    const headersObj: Record<string, string> = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => { headersObj[key] = value; });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => { headersObj[key] = value; });
      } else {
        Object.assign(headersObj, init.headers);
      }
    }

    const paymentSig =
      headersObj['PAYMENT-SIGNATURE'] ||
      headersObj['payment-signature'] ||
      headersObj['X-PAYMENT'] ||
      headersObj['x-payment'];

    let targetHost = 'unknown';
    try {
      targetHost = new URL(targetUrl).host;
    } catch {
      targetHost = 'invalid_or_relative';
    }

    // #region agent log
    debug.enabled && fetch(DEBUG_INGEST_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:debug.runId,hypothesisId:'B',location:'memento-app/lib/hooks/use-x402.ts:createProxyFetch',message:'customFetch -> proxy (pre)',data:{callId,targetHost,method:init?.method||'GET',hasPaymentSig:!!paymentSig,paymentSigLen:paymentSig?String(paymentSig).length:0,headerKeys:Object.keys(headersObj).slice(0,20)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const response = await globalThis.fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: targetUrl,
        method: init?.method || 'GET',
        headers: {
          ...headersObj,
          ...(debug.enabled ? { 'x-memento-debug': '1' } : {}),
        },
        body: init?.body
      })
    });

    const proxyData = await response.json();

    const dataObj =
      proxyData && typeof proxyData === 'object' && proxyData.data && typeof proxyData.data === 'object'
        ? (proxyData.data as Record<string, unknown>)
        : null;

    // #region agent log
    debug.enabled && fetch(DEBUG_INGEST_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:debug.runId,hypothesisId:'A',location:'memento-app/lib/hooks/use-x402.ts:createProxyFetch',message:'customFetch <- proxy (post)',data:{callId,status:proxyData?.status,ok:proxyData?.status>=200&&proxyData?.status<300,hasData:!!proxyData?.data,dataType:typeof proxyData?.data,hasResource:!!(dataObj&&('resource' in dataObj)),hasAccepted:!!(dataObj&&('accepted' in dataObj)),dataKeys:dataObj?Object.keys(dataObj).slice(0,20):null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    return new Response(
      typeof proxyData.data === 'string' ? proxyData.data : JSON.stringify(proxyData.data),
      {
        status: proxyData.status,
        statusText: proxyData.statusText || '',
        headers: new Headers(proxyData.headers || {})
      }
    );
  };
}

interface AccessCheckResponse {
  hasAccess: boolean;
  expiresAt?: string;
  remainingHours?: number;
}

interface PaymentResponse {
  success: boolean;
  accessGranted: boolean;
  expiresAt?: string;
  message?: string;
  error?: string;
}

export function useX402() {
  const [mounted, setMounted] = useState(false);
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => { setMounted(true); }, []);

  const isConnected = mounted && wallet.connected;
  const address = mounted ? wallet.publicKey?.toString() : undefined;
  const debugEnabled =
    mounted &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('x402debug');
  const debugRunId =
    debugEnabled && typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('x402run') || 'run1'
      : 'disabled';

  const checkAccess = useCallback(async (): Promise<AccessCheckResponse> => {
    if (!address) return { hasAccess: false };
    try {
      const response = await fetch(`${X402_SERVER_URL}/api/access/check?userAddress=${address}`);
      if (!response.ok) throw new Error('Failed to check access');
      return await response.json();
    } catch (err) {
      console.error('[useX402] Check access error:', err);
      return { hasAccess: false };
    }
  }, [address]);

  const requestAccess = useCallback(async (accessType: 'human' | 'agent' = 'human'): Promise<PaymentResponse> => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first.');
      return { success: false, accessGranted: false, error: 'Wallet not connected' };
    }

    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Wallet not ready.');
      return { success: false, accessGranted: false, error: 'Wallet not ready' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const addrShort = `${address.slice(0, 4)}...${address.slice(-4)}`;
      let serverHost = 'unknown';
      let rpcHost = 'unknown';
      try { serverHost = new URL(X402_SERVER_URL).host; } catch {}
      try { rpcHost = new URL(HELIUS_RPC).host; } catch {}

      // #region agent log
      debugEnabled && fetch(DEBUG_INGEST_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:debugRunId,hypothesisId:'D',location:'memento-app/lib/hooks/use-x402.ts:requestAccess',message:'requestAccess start',data:{accessType,addr:addrShort,serverHost,rpcHost,hasSignTx:!!wallet.signTransaction},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      // Import and create client - EXACTLY as per README
      const { createX402Client } = await import('@payai/x402-solana/client');
      
      const client = createX402Client({
        wallet: {
          address: wallet.publicKey.toString(),
          signTransaction: async (tx) => {
            if (!wallet.signTransaction) throw new Error('Wallet does not support signing');
            // #region agent log
            debugEnabled && fetch(DEBUG_INGEST_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:debugRunId,hypothesisId:'C',location:'memento-app/lib/hooks/use-x402.ts:signTransaction',message:'wallet.signTransaction invoked',data:{txType:(tx as any)?.constructor?.name||typeof tx},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            return await wallet.signTransaction(tx);
          },
        },
        network: 'solana', // mainnet
        rpcUrl: HELIUS_RPC, // custom RPC to avoid rate limits
        amount: BigInt(10_000_000), // max 10 USDC safety limit
        customFetch: createProxyFetch({ enabled: debugEnabled, runId: debugRunId }), // proxy for CORS
      });

      // Make paid request - EXACTLY as per README
      console.log('[x402] Making paid request to:', `${X402_SERVER_URL}/aggregator/solana`);
      
      let response: Response;
      try {
        response = await client.fetch(`${X402_SERVER_URL}/aggregator/solana`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: address, accessType }),
        });
        console.log('[x402] Response status:', response.status);
      } catch (fetchErr) {
        console.error('[x402] client.fetch threw:', fetchErr);
        throw fetchErr;
      }

      let result: any;
      try {
        result = await response.json();
        console.log('[x402] Response body:', JSON.stringify(result).substring(0, 500));
      } catch (jsonErr) {
        console.error('[x402] Failed to parse response JSON:', jsonErr);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('[x402] Response not OK:', response.status, result);
        throw new Error(result.error || result.reason || 'Payment failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      console.error('[useX402] Error:', err);
      // #region agent log
      debugEnabled && fetch(DEBUG_INGEST_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:debugRunId,hypothesisId:'D',location:'memento-app/lib/hooks/use-x402.ts:requestAccess',message:'requestAccess error',data:{name:err instanceof Error?err.name:'Unknown',message:errorMessage},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setError(errorMessage);
      return { success: false, accessGranted: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, wallet.publicKey, wallet.signTransaction, debugEnabled, debugRunId]);

  return {
    checkAccess,
    requestAccess,
    isLoading,
    error,
    isConnected,
    publicKey: address,
  };
}
