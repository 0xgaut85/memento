'use client';

/**
 * AppProviders - Simplified to use only Native Solana Wallet Adapter
 * As per x402-solana README: https://github.com/PayAINetwork/x402-solana
 * 
 * Uses dynamic import to prevent SSR issues with wallet adapters
 */

import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

// Dynamically import SolanaWalletProvider with SSR disabled
const SolanaWalletProvider = dynamic(
  () => import('./SolanaWalletProvider').then((mod) => mod.SolanaWalletProvider),
  { ssr: false }
);

// Create query client outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering wallet provider until mounted
  if (!mounted) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaWalletProvider>
        {children}
      </SolanaWalletProvider>
    </QueryClientProvider>
  );
}
