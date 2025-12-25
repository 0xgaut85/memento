'use client';

/**
 * CustomWalletModal - Premium wallet selection modal
 * Matches the Memento design system
 * 
 * Wallet compatibility notes:
 * - Phantom: Lighthouse security update causes x402 issues
 * - Solflare: May modify transactions, causing verification failures
 * - Backpack: Recommended - works well with x402
 * - Privy: Embedded wallet option for seamless onboarding
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import Image from 'next/image';

// Wallets with known x402 compatibility issues
const PROBLEMATIC_WALLETS = ['Phantom', 'Solflare'];

// Recommended wallets that work well with x402
const RECOMMENDED_WALLETS = ['Backpack'];

export function CustomWalletModal() {
  const { wallets, select, connecting } = useWallet();
  const { visible, setVisible } = useWalletModal();

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        setVisible(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [visible, setVisible]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  const handleWalletSelect = useCallback(
    async (walletName: string) => {
      const wallet = wallets.find((w) => w.adapter.name === walletName);
      if (wallet) {
        select(wallet.adapter.name);
        setVisible(false);
      }
    },
    [wallets, select, setVisible]
  );

  // Filter to installed/detected wallets and exclude regular MetaMask (keep only Solana-compatible ones)
  const detectedWallets = useMemo(() => {
    return wallets.filter((w) => {
      const isReady = w.readyState === 'Installed' || w.readyState === 'Loadable';
      // Exclude regular MetaMask (not the Solana Snap version)
      const isRegularMetaMask = w.adapter.name === 'MetaMask' && !w.adapter.name.includes('Snap');
      return isReady && !isRegularMetaMask;
    });
  }, [wallets]);

  // Sort wallets: recommended first, then normal, then problematic at the end
  const sortedWallets = useMemo(() => {
    return [...detectedWallets].sort((a, b) => {
      const aIsRecommended = RECOMMENDED_WALLETS.includes(a.adapter.name);
      const bIsRecommended = RECOMMENDED_WALLETS.includes(b.adapter.name);
      const aIsProblematic = PROBLEMATIC_WALLETS.includes(a.adapter.name);
      const bIsProblematic = PROBLEMATIC_WALLETS.includes(b.adapter.name);

      // Recommended wallets first
      if (aIsRecommended && !bIsRecommended) return -1;
      if (!aIsRecommended && bIsRecommended) return 1;

      // Problematic wallets last
      if (aIsProblematic && !bIsProblematic) return 1;
      if (!aIsProblematic && bIsProblematic) return -1;

      return 0;
    });
  }, [detectedWallets]);

  const isProblematic = (name: string) => PROBLEMATIC_WALLETS.includes(name);
  const isRecommended = (name: string) => RECOMMENDED_WALLETS.includes(name);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={() => !connecting && setVisible(false)}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 bg-white shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Connect Wallet</h2>
                    <p className="text-sm text-foreground/50">Select your Solana wallet</p>
                  </div>
                </div>
                <button
                  onClick={() => setVisible(false)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={connecting}
                >
                  <X className="w-5 h-5 text-foreground/50" />
                </button>
              </div>
            </div>

            {/* Wallet List */}
            <div className="px-8 py-6 max-h-[50vh] overflow-y-auto">
              {sortedWallets.length > 0 ? (
                <div className="space-y-3">
                  {sortedWallets.map((wallet) => {
                    const problematic = isProblematic(wallet.adapter.name);
                    const recommended = isRecommended(wallet.adapter.name);

                    return (
                      <motion.button
                        key={wallet.adapter.name}
                        onClick={() => handleWalletSelect(wallet.adapter.name)}
                        disabled={connecting}
                        className={`w-full group relative overflow-hidden ${problematic ? 'opacity-60' : ''}`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className={`relative flex items-center gap-4 p-4 border transition-all duration-200 ${
                          problematic 
                            ? 'bg-red-50/50 border-red-100 hover:border-red-200' 
                            : recommended
                              ? 'bg-green-50/50 border-green-100 hover:border-green-200'
                              : 'bg-gray-50 border-gray-100 hover:border-gray-200 hover:bg-gray-100/80'
                        }`}>
                          {/* Wallet Icon */}
                          <div className="w-12 h-12 bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                            {wallet.adapter.icon && (
                              <Image
                                src={wallet.adapter.icon}
                                alt={wallet.adapter.name}
                                width={32}
                                height={32}
                                className="w-8 h-8"
                              />
                            )}
                          </div>

                          {/* Wallet Info */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground tracking-tight">
                                {wallet.adapter.name}
                              </p>
                              {recommended && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground/50">
                              {problematic ? (
                                <span className="text-red-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  May have x402 issues
                                </span>
                              ) : recommended ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Works with x402
                                </span>
                              ) : (
                                wallet.readyState === 'Installed' ? 'Detected' : 'Available'
                              )}
                            </p>
                          </div>

                          {/* Warning or Arrow */}
                          <div className="w-8 h-8 flex items-center justify-center">
                            {problematic ? (
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                            ) : (
                              <svg
                                className="w-5 h-5 text-foreground/30 group-hover:text-foreground/60 group-hover:translate-x-0.5 transition-all"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Hover effect */}
                          {!problematic && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}

                  {/* Privy option */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-foreground/40 mb-3 uppercase tracking-wider font-medium">
                      Or use an embedded wallet
                    </p>
                    <a
                      href="https://privy.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 hover:border-indigo-200 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        P
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-foreground tracking-tight">Privy</p>
                        <p className="text-sm text-foreground/50">Embedded wallet • Coming soon</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-foreground/30" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-foreground/30" />
                  </div>
                  <p className="text-foreground/60 mb-2">No wallets detected</p>
                  <p className="text-sm text-foreground/40">
                    Install a Solana wallet to continue
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/40">Powered by x402</span>
                <a
                  href="https://solana.com/ecosystem/explore?categories=wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-foreground/50 hover:text-foreground transition-colors"
                >
                  Get a wallet
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Loading overlay */}
            <AnimatePresence>
              {connecting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 relative">
                      <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="font-semibold">Connecting...</p>
                    <p className="text-sm text-foreground/50 mt-1">
                      Approve in your wallet
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
