'use client';

/**
 * SolanaWalletProvider - Native Solana Wallet Adapter
 * This handles the actual transaction signing for x402
 * Replicating the nolimit app pattern exactly
 */

import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Solana RPC URL (Helius mainnet)
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);

  // Initialize wallets - these work with @solana/web3.js
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

