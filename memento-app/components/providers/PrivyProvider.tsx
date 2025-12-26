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
          walletChainType: 'solana-only', // Only show Solana wallets
        },
        // Embedded wallet config - create for users without wallets
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}
