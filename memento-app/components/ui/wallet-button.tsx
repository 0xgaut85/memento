'use client';

/**
 * WalletButton - Custom wallet connection button with error handling
 * Uses native Solana Wallet Adapter with retry logic
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// Import styles
import '@solana/wallet-adapter-react-ui/styles.css';

function WalletButtonPlaceholder() {
  return (
    <button
      className="px-4 py-2.5 bg-pink-100 text-pink-800 rounded-xl font-medium text-sm"
      disabled
    >
      Loading...
    </button>
  );
}

function WalletButtonInner() {
  const { publicKey, wallet, disconnect, connecting, connected, select, wallets } = useWallet();
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
        // Small delay to ensure wallet is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        await wallet.adapter.connect();
      } catch (error: unknown) {
        console.warn('[WalletButton] Connection error, will retry:', error);
        // On error, deselect and show modal again
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
      <div className="relative group">
      <button
          className="px-4 py-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-medium text-sm flex items-center gap-2 transition-all hover:bg-emerald-200"
          onClick={handleDisconnect}
        >
          {wallet?.adapter.icon && (
            <img 
              src={wallet.adapter.icon} 
              alt={wallet.adapter.name} 
              className="w-4 h-4"
            />
          )}
          {formatAddress(publicKey.toString())}
      </button>
      </div>
    );
  }

  // Not connected - show connect button
  return (
      <button
      className="px-4 py-2.5 bg-pink-100 text-pink-800 rounded-xl font-medium text-sm transition-all hover:bg-pink-200 disabled:opacity-50"
      onClick={handleConnect}
      disabled={connecting || isRetrying}
      >
      {connecting || isRetrying ? 'Connecting...' : 'Select Wallet'}
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

  return (
    <>
      <WalletButtonInner />
      <style jsx global>{`
        .wallet-adapter-modal-wrapper {
          background-color: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(4px) !important;
          z-index: 9999 !important;
        }
        .wallet-adapter-modal-container {
          background-color: white !important;
          border-radius: 1rem !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25) !important;
        }
        .wallet-adapter-modal-title {
          color: #111827 !important;
          font-weight: 700 !important;
        }
        .wallet-adapter-modal-list li {
          margin-bottom: 0.5rem !important;
        }
        .wallet-adapter-modal-list .wallet-adapter-button {
          background-color: #f9fafb !important;
          color: #111827 !important;
          border-radius: 0.75rem !important;
          border: 1px solid #e5e7eb !important;
        }
        .wallet-adapter-modal-list .wallet-adapter-button:hover {
          background-color: #f3f4f6 !important;
          border-color: #d1d5db !important;
        }
        .wallet-adapter-modal-button-close {
          background-color: transparent !important;
        }
        .wallet-adapter-modal-button-close:hover {
          background-color: #f3f4f6 !important;
        }
      `}</style>
    </>
  );
}
