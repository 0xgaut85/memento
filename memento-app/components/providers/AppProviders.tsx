'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Create query client for React Query
const queryClient = new QueryClient();

// Reown Project ID - get from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'bb1ac17de596e3590a24a476c5cb419c';

// Solana RPC URL
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

// Configure Solana adapter with wallets
const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// Define networks - must be non-empty tuple
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [solana];

// Metadata for the app
const metadata = {
  name: 'Memento',
  description: 'Privacy-focused yield aggregator',
  url: 'https://app.memento.money',
  icons: ['https://app.memento.money/favicon.ico'],
};

// Initialize AppKit (singleton)
createAppKit({
  adapters: [solanaAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: false,
  },
  // Custom RPC for better reliability
  solanaConfig: {
    defaultChainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
