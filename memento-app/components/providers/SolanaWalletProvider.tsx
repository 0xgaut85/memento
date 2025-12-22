'use client';

/**
 * SolanaWalletProvider - Native Solana Wallet Adapter
 * 
 * Modern wallets (Phantom, Solflare, etc.) register themselves as "Standard Wallets"
 * automatically via the Wallet Standard. We don't need to manually add adapters.
 * 
 * See: https://github.com/wallet-standard/wallet-standard
 */

import { ReactNode, useMemo, useCallback } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletError } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Solana RPC URL - mainnet
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET || 
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
  'https://api.mainnet-beta.solana.com';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);

  // Empty array - let Standard Wallet detection handle wallet discovery
  // Modern wallets like Phantom, Solflare, Backpack auto-register themselves
  const wallets = useMemo(() => [], []);

  // Error handler for wallet connection errors
  const onError = useCallback((error: WalletError) => {
    // Only log non-user-rejected errors
    if (error.name !== 'WalletConnectionError' || 
        !error.message?.includes('User rejected')) {
      console.error('[Wallet Error]', error.name, error.message);
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false}
        onError={onError}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
