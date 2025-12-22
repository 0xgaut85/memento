'use client';

import { ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, type AppKitNetwork } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create query client for React Query
const queryClient = new QueryClient();

// Project ID from Reown Cloud
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'a7872db4a69c8c1b91b3ef751f119bd0';

// Create Solana adapter for Reown AppKit
const solanaAdapter = new SolanaAdapter();

// Solana only - no EVM networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [solana];

// Initialize Reown AppKit with Solana only
// Per official docs: https://docs.reown.com/appkit/next/core/installation
createAppKit({
  adapters: [solanaAdapter],
  networks,
  defaultNetwork: solana,
  projectId,
  metadata: {
    name: 'Memento',
    description: 'Stablecoin Yield Aggregator - Find the best yields across DeFi',
    url: 'https://app.memento.money',
    icons: ['https://app.memento.money/transparentlogo.png'],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: 'light',
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
