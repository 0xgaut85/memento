'use client';

/**
 * WalletButton - Using official Solana Wallet Adapter UI
 * Following @payai/x402-solana docs
 * https://github.com/PayAINetwork/x402-solana
 */

import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function WalletButton() {
  return (
    <WalletMultiButton 
      style={{
        backgroundColor: '#fce7f3', // pink-100
        color: '#9d174d', // pink-800
        borderRadius: '0.75rem',
        fontWeight: 500,
        fontSize: '0.875rem',
        height: 'auto',
        padding: '0.625rem 1rem',
      }}
    />
  );
}
