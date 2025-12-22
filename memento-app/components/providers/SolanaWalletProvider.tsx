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
import { WalletError, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  // Use mainnet
  const network = WalletAdapterNetwork.Mainnet;
  
  // Get endpoint - prefer custom RPC, fallback to Solana's cluster API
  const endpoint = useMemo(() => {
    const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET || 
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    
    if (customRpc) {
      return customRpc;
    }
    
    // Use Solana's official cluster API URL
    return clusterApiUrl(network);
  }, [network]);

  // Explicit adapters to avoid wallet-standard edge cases
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  // Error handler - suppress expected errors, log unexpected ones
  const onError = useCallback((error: WalletError) => {
    // These are expected errors that users might trigger
    const expectedErrors = [
      'User rejected',
      'User cancelled', 
      'User denied',
      'The user rejected',
      'Popup closed',
      'already pending', // Connection already in progress
    ];
    
    const isExpectedError = expectedErrors.some(msg => 
      error.message?.toLowerCase().includes(msg.toLowerCase())
    );
    
    if (!isExpectedError) {
      // Log unexpected errors but don't crash
      console.warn('[Wallet Warning]', error.name, error.message);
    }
  }, []);

  return (
    <ConnectionProvider 
      endpoint={endpoint}
      config={{ 
        commitment: 'confirmed',
        wsEndpoint: endpoint.replace('https', 'wss'),
      }}
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
