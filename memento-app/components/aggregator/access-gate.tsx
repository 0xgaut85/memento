'use client';

/**
 * AccessGate - Payment wall for Aggregator access
 * Uses native Solana Wallet Adapter for connection and x402 payments
 * As per x402-solana README: https://github.com/PayAINetwork/x402-solana
 * 
 * This component is SSR-safe and only renders wallet-dependent content on client
 */

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the actual gate content to prevent SSR issues
const AccessGateContent = dynamic(
  () => import('./AccessGateContent').then((mod) => mod.AccessGateContent),
  { 
    ssr: false,
    loading: () => <AccessGateLoading />
  }
);

function AccessGateLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 animate-pulse bg-gray-200 rounded-lg" />
        <p className="text-lg font-serif italic text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

interface AccessGateProps {
  children: React.ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before mount, show loading
  if (!mounted) {
    return <AccessGateLoading />;
  }

  return <AccessGateContent>{children}</AccessGateContent>;
}
