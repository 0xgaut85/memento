'use client';

/**
 * SolanaWalletProvider - Native Solana Wallet Adapter
 * Exactly as per x402-solana README: https://github.com/PayAINetwork/x402-solana
 * 
 * This handles wallet connection AND transaction signing for x402
 */

import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

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
  // Network - mainnet for production
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);

  // Wallets - exactly as per x402-solana README
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
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
