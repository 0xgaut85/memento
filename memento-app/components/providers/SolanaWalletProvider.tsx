'use client';

/**
 * SolanaWalletProvider - Native Solana Wallet Adapter
 * Using Helius RPC for reliable mainnet connection
 * 
 * NOTE: Phantom is excluded due to Lighthouse program injection issue
 * See: https://github.com/coinbase/x402/issues/828
 */

import { ReactNode, useMemo, useCallback } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletError } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Helius RPC endpoint for mainnet
const HELIUS_RPC = 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  // Use Helius RPC - env var override if needed
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || HELIUS_RPC;
  }, []);

  // Explicit adapters - Solflare and Backpack (Phantom excluded due to Lighthouse issue)
  // See: https://github.com/coinbase/x402/issues/828
  const wallets = useMemo(
    () => [new SolflareWalletAdapter(), new BackpackWalletAdapter()],
    []
  );

  // Error handler
  const onError = useCallback((error: WalletError) => {
    const expectedErrors = [
      'User rejected',
      'User cancelled', 
      'User denied',
      'The user rejected',
      'Popup closed',
      'already pending',
    ];
    
    const isExpectedError = expectedErrors.some(msg => 
      error.message?.toLowerCase().includes(msg.toLowerCase())
    );
    
    if (!isExpectedError) {
      console.warn('[Wallet Warning]', error.name, error.message);
    }
  }, []);

  return (
    <ConnectionProvider 
      endpoint={endpoint}
      config={{ commitment: 'confirmed' }}
    >
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
