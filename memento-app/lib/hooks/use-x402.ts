'use client';

/**
 * useX402 Hook - x402 payment integration
 * EXACTLY as per x402-solana README: https://github.com/PayAINetwork/x402-solana
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const X402_SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'https://x402.memento.money';

// Proxy fetch to bypass CORS - as per README
function createProxyFetch(): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const targetUrl = typeof input === 'string' ? input : input.toString();
    
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

    const response = await globalThis.fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: targetUrl,
        method: init?.method || 'GET',
        headers: headersObj,
        body: init?.body
      })
    });

    const proxyData = await response.json();

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
      // Import and create client - EXACTLY as per README
      const { createX402Client } = await import('@payai/x402-solana/client');
      
      const client = createX402Client({
        wallet: {
          address: wallet.publicKey.toString(),
          signTransaction: async (tx) => {
            if (!wallet.signTransaction) throw new Error('Wallet does not support signing');
            return await wallet.signTransaction(tx);
          },
        },
        network: 'solana', // mainnet
        amount: BigInt(10_000_000), // max 10 USDC safety limit
        customFetch: createProxyFetch(), // proxy for CORS
      });

      // Make paid request - EXACTLY as per README
      const response = await client.fetch(`${X402_SERVER_URL}/aggregator/solana`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address, accessType }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.reason || 'Payment failed');
      }

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
