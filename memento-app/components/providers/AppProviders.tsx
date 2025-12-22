'use client';

/**
 * AppProviders - Reown AppKit + Solana Wallet Adapter
 * Replicating the nolimit app pattern exactly
 */

import { ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { base, solana } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { SolanaWalletProvider } from './SolanaWalletProvider';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Create query client
const queryClient = new QueryClient();

// Project ID from Reown Cloud
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'a7872db4a69c8c1b91b3ef751f119bd0';

// Create Wagmi adapter for Base (EVM)
const wagmiAdapter = new WagmiAdapter({
  networks: [base],
  projectId,
});

// Create Solana adapter for Reown (wallet display/connection UI)
const solanaAdapter = new SolanaAdapter();

// Networks as mutable tuple
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [base, solana];

// Create App Kit - simple setup with Base and Solana only
createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  networks,
  defaultNetwork: base,
  projectId,
  metadata: {
    name: 'Memento',
    description: 'A new global privacy focused standard for earning yield on stablecoins',
    url: 'https://app.memento.money',
    icons: ['https://memento.money/transparentlogo.png'],
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
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
