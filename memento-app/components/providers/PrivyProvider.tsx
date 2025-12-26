'use client';

/**
 * PrivyProvider - Privy Embedded Wallet Integration
 * Official docs: https://docs.privy.io/recipes/solana/getting-started-with-privy-and-solana
 */

import { ReactNode } from 'react';
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';

// Privy App ID from environment variable
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

// Initialize Solana wallet connectors for external wallet detection
const solanaConnectors = toSolanaWalletConnectors();

// Solana RPC configuration - required for embedded wallet transactions
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const SOLANA_WS_URL = process.env.NEXT_PUBLIC_SOLANA_WS_URL || 'wss://api.mainnet-beta.solana.com';

interface PrivyWalletProviderProps {
  children: ReactNode;
}

export function PrivyWalletProvider({ children }: PrivyWalletProviderProps) {
  if (!PRIVY_APP_ID) {
    console.warn('[Privy] No PRIVY_APP_ID configured - Privy login will be disabled');
    return <>{children}</>;
  }

  return (
    <PrivyProviderBase
      appId={PRIVY_APP_ID}
      config={{
        // Solana RPC configuration - required for embedded wallet UIs
        solana: {
          rpcs: {
            'solana:mainnet': {
              rpc: createSolanaRpc(SOLANA_RPC_URL),
              rpcSubscriptions: createSolanaRpcSubscriptions(SOLANA_WS_URL),
            },
          },
        },
        // Appearance customization
        appearance: {
          theme: 'light',
          accentColor: '#a855f7', // Purple accent to match Memento
          logo: '/transparentlogo.png',
          walletChainType: 'solana-only', // Only show Solana wallets
          showWalletLoginFirst: true, // Show wallet options first
        },
        // Login methods - wallet and email
        loginMethods: ['wallet', 'email'],
        // External wallet connectors for proper Solana wallet detection
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        // Embedded wallet config - create for users without wallets
        embeddedWallets: {
          solana: {
            createOnLogin: 'all-users',
          },
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}
