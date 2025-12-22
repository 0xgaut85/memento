'use client';

/**
 * AppProviders - Solana Wallet Adapter setup
 * Following official @payai/x402-solana docs exactly
 * https://github.com/PayAINetwork/x402-solana
 */

import { ReactNode, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Create query client for React Query
const queryClient = new QueryClient();

// Solana RPC URL (Helius mainnet)
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);
  
  // Use empty array - modern wallets (Phantom, Solflare) register as Standard Wallets
  // and are auto-detected by the adapter. Explicitly adding adapters can cause conflicts.
  const wallets = useMemo(() => [], []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}
