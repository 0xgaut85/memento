'use client';

import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

// Solana mainnet RPC endpoint
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);

  // Initialize wallets - Phantom, Solflare, Coinbase, Ledger
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

