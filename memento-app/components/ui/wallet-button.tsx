'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function WalletButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Format address for display (e.g., "3xK4...7b2F")
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
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
        <span>{formatAddress(address || '')}</span>
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
            View Account
          </button>
          <button
            onClick={() => {
              open({ view: 'Account' });
              setShowDropdown(false);
            }}
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





