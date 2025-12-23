'use client';

/**
 * useX402 Hook - x402 payment integration
 * EXACTLY as per x402-solana README: https://github.com/PayAINetwork/x402-solana
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// #region agent log
const debugLog = (location: string, message: string, data: Record<string, unknown>, hypothesisId: string) => {
  fetch('http://127.0.0.1:7242/ingest/4fb0bd68-12cf-4c70-8923-01627438f337',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location,message,data,timestamp:Date.now(),sessionId:'debug-session',hypothesisId})}).catch(()=>{});
};
// #endregion

const X402_SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'https://x402.memento.money';

// Helius RPC for mainnet - avoids rate limits on public RPC
const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

// Proxy fetch to bypass CORS - as per README
function createProxyFetch(): typeof fetch {
  let callCount = 0;
  
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    callCount++;
    const targetUrl = typeof input === 'string' ? input : input.toString();
    
    // Extract headers
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
    
    // Check for payment header
    const paymentSig = headersObj['PAYMENT-SIGNATURE'] || headersObj['payment-signature'];
    console.log(`[customFetch #${callCount}] URL: ${targetUrl}`);
    console.log(`[customFetch #${callCount}] Method: ${init?.method || 'GET'}`);
    console.log(`[customFetch #${callCount}] Has PAYMENT-SIGNATURE: ${!!paymentSig}${paymentSig ? ` (${paymentSig.length} chars)` : ''}`);
    console.log(`[customFetch #${callCount}] All headers:`, Object.keys(headersObj));
    
    // #region agent log
    if (paymentSig) {
      try {
        const decoded = JSON.parse(atob(paymentSig));
        debugLog('use-x402.ts:customFetch', 'PAYMENT-SIGNATURE decoded', {
          x402Version: decoded.x402Version,
          resourceUrl: decoded.resource?.url,
          acceptedScheme: decoded.accepted?.scheme,
          acceptedNetwork: decoded.accepted?.network,
          acceptedAmount: decoded.accepted?.amount,
          payloadType: decoded.payload?.type,
          signatureLength: decoded.payload?.signature?.length,
          transactionLength: decoded.payload?.transaction?.length,
        }, 'C,E');
      } catch (e) {
        debugLog('use-x402.ts:customFetch', 'PAYMENT-SIGNATURE decode FAILED', { error: String(e), sigLength: paymentSig.length }, 'E');
      }
    }
    // #endregion

    try {
      const proxyResponse = await globalThis.fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          method: init?.method || 'GET',
          headers: headersObj,
          body: init?.body
        })
      });

      const proxyData = await proxyResponse.json();
      
      // CRITICAL: Ensure status is a NUMBER, not string
      // The x402 client uses strict equality: response.status !== 402
      const statusNum = typeof proxyData.status === 'number' ? proxyData.status : parseInt(String(proxyData.status), 10);
      
      console.log(`[customFetch #${callCount}] Proxy returned status: ${statusNum} (type: ${typeof statusNum})`);

      const response = new Response(
        typeof proxyData.data === 'string' ? proxyData.data : JSON.stringify(proxyData.data),
        {
          status: statusNum,
          statusText: proxyData.statusText || '',
          headers: new Headers(proxyData.headers || {})
        }
      );
      
      console.log(`[customFetch #${callCount}] Response.status: ${response.status} (type: ${typeof response.status})`);
      
      return response;
    } catch (err) {
      console.error(`[customFetch #${callCount}] Error:`, err);
      throw err;
    }
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
      console.log('[x402] Starting payment flow...');
      console.log('[x402] Wallet:', address);
      console.log('[x402] RPC:', HELIUS_RPC);
      
      // Import and create client - EXACTLY as per README
      const { createX402Client } = await import('@payai/x402-solana/client');
      
      // #region agent log
      debugLog('use-x402.ts:requestAccess', 'x402 client imported', {
        hasCreateX402Client: typeof createX402Client === 'function',
        walletAddress: address,
        network: 'solana',
      }, 'A');
      // #endregion
      
      console.log('[x402] Creating x402 client...');
      
      // Pass wallet with both publicKey and address for compatibility
      const walletAdapter = {
        publicKey: wallet.publicKey,
        address: wallet.publicKey.toString(),
        signTransaction: async (tx: any) => {
          console.log('[x402] >>> signTransaction called <<<');
          // #region agent log
          debugLog('use-x402.ts:signTransaction', 'Transaction BEFORE signing', {
            numSignatures: tx.signatures?.length,
            messageVersion: tx.message?.version,
            numInstructions: tx.message?.compiledInstructions?.length,
            instructionProgramIds: tx.message?.compiledInstructions?.map((ix: any) => tx.message?.staticAccountKeys?.[ix.programIdIndex]?.toString()),
          }, 'B,D');
          // #endregion
          if (!wallet.signTransaction) throw new Error('Wallet does not support signing');
          try {
            const signed = await wallet.signTransaction(tx);
            console.log('[x402] >>> Transaction signed! <<<');
            // #region agent log
            debugLog('use-x402.ts:signTransaction', 'Transaction AFTER signing', {
              numSignatures: signed.signatures?.length,
              numInstructions: signed.message?.compiledInstructions?.length,
            }, 'D');
            // #endregion
            return signed;
          } catch (signErr) {
            console.error('[x402] signTransaction error:', signErr);
            throw signErr;
          }
        },
      };
      
      console.log('[x402] Creating client with wallet:', walletAdapter.address);
      
      const client = createX402Client({
        wallet: walletAdapter,
        network: 'solana',
        rpcUrl: HELIUS_RPC,
        amount: BigInt(10_000_000),
        customFetch: createProxyFetch(),
        verbose: true,
      });

      console.log('[x402] Client created, making paid request...');

      // Make paid request - EXACTLY as per README
      let response: Response;
      try {
        response = await client.fetch(`${X402_SERVER_URL}/aggregator/solana`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: address, accessType }),
        });
        console.log('[x402] Got response, status:', response.status);
      } catch (fetchErr) {
        console.error('[x402] client.fetch threw:', fetchErr);
        throw fetchErr;
      }

      let result: any;
      try {
        result = await response.json();
        console.log('[x402] Response body:', JSON.stringify(result).substring(0, 500));
        // #region agent log
        debugLog('use-x402.ts:requestAccess', 'Final response received', {
          status: response.status,
          success: result.success,
          error: result.error,
          reason: result.reason,
          accessGranted: result.accessGranted,
        }, 'C');
        // #endregion
      } catch (jsonErr) {
        console.error('[x402] Failed to parse response JSON:', jsonErr);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('[x402] Response not OK:', response.status, result);
        throw new Error(result.error || result.reason || 'Payment failed');
      }

      console.log('[x402] Payment successful!');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      console.error('[useX402] Error:', err);
      setError(errorMessage);
      return { success: false, accessGranted: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, wallet.publicKey, wallet.signTransaction]);

  return {
    checkAccess,
    requestAccess,
    isLoading,
    error,
    isConnected,
    publicKey: address,
  };
}
