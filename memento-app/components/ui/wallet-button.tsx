'use client';

/**
 * WalletButton - Uses Reown AppKit for connection UI
 * and native Solana adapter for actual wallet operations
 */

import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function WalletButton() {
  // Reown AppKit hooks
  const { open } = useAppKit();
  const solanaAccount = useAppKitAccount({ namespace: 'solana' });
  const { disconnect: disconnectReown } = useDisconnect();
  
  // Native Solana wallet adapter (for x402 compatibility)
  const { publicKey, connected, disconnect: disconnectNative } = useWallet();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prefer native adapter, fallback to Reown
  const isConnected = connected || solanaAccount.isConnected;
  const address = publicKey?.toBase58() || solanaAccount.address;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // Open Reown modal
  const handleConnect = () => {
    open();
  };

  const handleDisconnect = async () => {
    try {
      if (connected) {
        await disconnectNative();
      }
      if (solanaAccount.isConnected) {
        await disconnectReown();
      }
    } catch (e) {
      console.error('Disconnect error:', e);
    }
    setShowDropdown(false);
  };

  if (!isConnected || !address) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center gap-2 px-4 py-2.5 bg-pink-200 text-pink-800 hover:bg-pink-300 rounded-xl font-medium transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-xl font-medium transition-colors"
      >
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span>{formatAddress(address)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
          <button
            onClick={() => {
              open({ view: 'Account' });
              setShowDropdown(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Account Details
          </button>
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
