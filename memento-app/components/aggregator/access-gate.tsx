'use client';

/**
 * AccessGate - Payment wall for Aggregator access
 * Uses native Solana Wallet Adapter for connection and x402 payments
 * As per x402-solana README: https://github.com/PayAINetwork/x402-solana
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useX402 } from '@/lib/hooks/use-x402';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ArrowRight, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface AccessGateProps {
  children: React.ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const { checkAccess, requestAccess, isLoading, error, isConnected, publicKey } = useX402();
  const { setVisible } = useWalletModal();
  const wallet = useWallet();
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [remainingHours, setRemainingHours] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState<string>('');

  // Check access on mount and when wallet changes
  const doCheckAccess = useCallback(async () => {
    if (!isConnected || !publicKey) {
      setHasAccess(false);
      return;
    }

    const result = await checkAccess();
    setHasAccess(result.hasAccess);
    setExpiresAt(result.expiresAt || null);
    setRemainingHours(result.remainingHours || null);
  }, [isConnected, publicKey, checkAccess]);

  useEffect(() => {
    doCheckAccess();
  }, [doCheckAccess]);

  // Handle payment request
  const handleRequestAccess = async () => {
    setPaymentStatus('processing');
    setPaymentMessage('Initiating payment...');

    const result = await requestAccess('human');

    if (result.success && result.accessGranted) {
      setPaymentStatus('success');
      setPaymentMessage(result.message || 'Welcome to the aggregator.');
      setHasAccess(true);
      setExpiresAt(result.expiresAt || null);
      
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentStatus('idle');
      }, 2000);
    } else {
      setPaymentStatus('error');
      setPaymentMessage(result.error || 'Payment failed. Please try again.');
    }
  };

  // Open native Solana wallet modal
  const handleConnectWallet = () => {
    setVisible(true);
  };

  // Loading state
  if (hasAccess === null && isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <Image
            src="/transparentlogo.png"
            alt="Memento"
            width={64}
            height={64}
            className="w-16 h-16 animate-pulse"
          />
          <p className="text-lg font-serif italic text-foreground/60">Verifying access...</p>
        </motion.div>
      </div>
    );
  }

  // User has access
  if (hasAccess) {
    return (
      <>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-black text-white px-5 py-3 flex items-center gap-3 shadow-2xl">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium tracking-wide">
              Premium Active
              {remainingHours !== null && (
                <span className="text-white/60 ml-2">• {remainingHours}h left</span>
              )}
            </span>
          </div>
        </motion.div>
        {children}
      </>
    );
  }

  // Access gate
  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl w-full text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-10"
            >
              <Image
                src="/transparentlogo.png"
                alt="Memento"
                width={80}
                height={80}
                className="w-20 h-20 mx-auto"
              />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] mb-4"
            >
              Premium Access
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl sm:text-2xl md:text-3xl font-serif italic text-foreground/70 mb-12"
            >
              Unlock the full yield aggregator
            </motion.p>

            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-8 sm:p-10 mb-10 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8">
                <div className="text-center">
                  <p className="text-5xl sm:text-6xl font-black tracking-tight">$5</p>
                  <p className="text-sm text-foreground/50 mt-1 uppercase tracking-wider">USDC</p>
                </div>
                <div className="hidden sm:block w-px h-16 bg-gray-200" />
                <div className="text-center">
                  <p className="text-5xl sm:text-6xl font-black tracking-tight text-primary">24h</p>
                  <p className="text-sm text-foreground/50 mt-1 uppercase tracking-wider">Access</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-sm text-foreground/70">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>All yield opportunities</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Safe & Degen filtering</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Real-time APY data</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>AI-curated selection</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {!isConnected ? (
                <motion.button
                  onClick={handleConnectWallet}
                  className="group relative overflow-hidden w-full sm:w-auto text-lg px-12 py-5 bg-black text-white font-semibold transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Connect Wallet
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={isLoading}
                  className="group relative overflow-hidden w-full sm:w-auto text-lg px-12 py-5 bg-black text-white font-semibold transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Unlock for $5 USDC
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex items-center justify-center gap-2 text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </motion.div>

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 text-sm text-foreground/40"
            >
              Powered by x402 protocol • Instant access after payment
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => paymentStatus !== 'processing' && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-8 sm:p-10 text-center">
                {paymentStatus === 'processing' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-6 relative">
                      <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-2">Processing</h3>
                    <p className="text-foreground/60 font-serif italic">{paymentMessage}</p>
                    <p className="text-foreground/40 text-sm mt-4">
                      Approve the transaction in your wallet
                    </p>
                  </motion.div>
                )}

                {paymentStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
                    <h3 className="text-2xl font-black tracking-tight mb-2">Access Granted</h3>
                    <p className="text-foreground/60 font-serif italic">{paymentMessage}</p>
                  </motion.div>
                )}

                {paymentStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-black tracking-tight mb-2">Payment Failed</h3>
                    <p className="text-foreground/60 text-sm mb-6">{paymentMessage}</p>
                    <button
                      onClick={() => {
                        setPaymentStatus('idle');
                        handleRequestAccess();
                      }}
                      className="px-8 py-3 bg-black text-white font-semibold hover:bg-primary transition-colors"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}

                {paymentStatus === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Image
                      src="/transparentlogo.png"
                      alt="Memento"
                      width={56}
                      height={56}
                      className="w-14 h-14 mx-auto mb-6"
                    />
                    <h3 className="text-2xl font-black tracking-tight mb-2">Confirm Payment</h3>
                    <p className="text-foreground/60 mb-8">
                      <span className="text-3xl font-black text-black">$5 USDC</span>
                      <br />
                      <span className="font-serif italic">for 24-hour premium access</span>
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="flex-1 px-6 py-3 border-2 border-gray-200 text-foreground/70 font-semibold hover:border-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRequestAccess}
                        className="flex-1 px-6 py-3 bg-black text-white font-semibold hover:bg-primary transition-colors"
                      >
                        Pay Now
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
