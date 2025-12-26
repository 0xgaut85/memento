'use client';

/**
 * PrivyProvider - Privy Embedded Wallet Integration
 * Official docs: https://docs.privy.io/
 */

import { ReactNode } from 'react';
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';

// Privy App ID from environment variable
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

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
        // Appearance customization
        appearance: {
          theme: 'light',
          accentColor: '#a855f7', // Purple accent to match Memento
          logo: '/transparentlogo.png',
        },
        // Login methods - email, social, and wallet
        loginMethods: ['email', 'wallet', 'google'],
        // Solana configuration
        solanaClusters: [
          {
            name: 'mainnet-beta',
            rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f',
          },
        ],
        // Embedded wallet config - create for users without wallets
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}

