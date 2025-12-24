'use client';

/**
 * WalletButton - Custom wallet connection button
 * Premium design matching Memento style
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Image from 'next/image';

function WalletButtonPlaceholder() {
  return (
    <button
      className="px-5 py-2.5 bg-gray-100 text-gray-400 font-medium text-sm"
      disabled
    >
      Loading...
    </button>
  );
}

function WalletButtonInner() {
  const { publicKey, wallet, disconnect, connecting, connected, select } = useWallet();
  const { setVisible } = useWalletModal();
  const [isRetrying, setIsRetrying] = useState(false);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Handle connect with retry logic
  const handleConnect = useCallback(async () => {
    if (connecting || isRetrying) return;
    
    // If no wallet selected, open modal
    if (!wallet) {
      setVisible(true);
      return;
    }

    // If wallet selected but not connected, try to connect with retry
    if (wallet && !connected) {
      setIsRetrying(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        await wallet.adapter.connect();
      } catch (error: unknown) {
        console.warn('[WalletButton] Connection error, will retry:', error);
        select(null);
        setTimeout(() => setVisible(true), 300);
      } finally {
        setIsRetrying(false);
      }
    }
  }, [wallet, connected, connecting, isRetrying, setVisible, select]);

  // Handle disconnect
  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      console.warn('[WalletButton] Disconnect error:', error);
    }
  }, [disconnect]);

  // If connected, show address with disconnect option
  if (connected && publicKey) {
    return (
      <button
        className="group px-5 py-2.5 bg-black text-white font-medium text-sm flex items-center gap-2.5 transition-all hover:bg-primary"
        onClick={handleDisconnect}
      >
        {wallet?.adapter.icon && (
          <Image 
            src={wallet.adapter.icon} 
            alt={wallet.adapter.name} 
            width={16}
            height={16}
            className="w-4 h-4"
          />
        )}
        <span>{formatAddress(publicKey.toString())}</span>
        <span className="text-white/50 group-hover:text-white/80 transition-colors">×</span>
      </button>
    );
  }

  // Not connected - show connect button
  return (
    <button
      className="px-5 py-2.5 bg-black text-white font-medium text-sm transition-all hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleConnect}
      disabled={connecting || isRetrying}
    >
      {connecting || isRetrying ? (
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Connecting...
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}

export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <WalletButtonPlaceholder />;
  }

  return <WalletButtonInner />;
}
