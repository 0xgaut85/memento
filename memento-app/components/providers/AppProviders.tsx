'use client';

/**
 * AppProviders - Simplified to use only Native Solana Wallet Adapter
 * As per x402-solana README: https://github.com/PayAINetwork/x402-solana
 * 
 * Removed Reown AppKit to avoid connection conflicts
 */

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SolanaWalletProvider } from './SolanaWalletProvider';

// Create query client
const queryClient = new QueryClient();

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SolanaWalletProvider>
        {children}
      </SolanaWalletProvider>
    </QueryClientProvider>
  );
}
