'use client';

import { ReactNode, useMemo, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Create query client for React Query
const queryClient = new QueryClient();

// Solana RPC URL
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);
  
  const wallets = useMemo(
    () => {
      // #region agent log
      console.log('[DBG:PROVIDER] Creating wallet adapters');
      // #endregion
      try {
        const adapters = [
          new PhantomWalletAdapter(),
          new SolflareWalletAdapter(),
        ];
        // #region agent log
        console.log('[DBG:PROVIDER] Wallet adapters created', { count: adapters.length, names: adapters.map(w => w.name) });
        // #endregion
        return adapters;
      } catch (err) {
        // #region agent log
        console.error('[DBG:PROVIDER] Failed to create wallet adapters', err);
        // #endregion
        return [];
      }
    },
    []
  );

  // #region agent log
  useEffect(() => {
    console.log('[DBG:PROVIDER] AppProviders mounted', { endpoint, walletsCount: wallets.length });
  }, [endpoint, wallets]);
  // #endregion

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
