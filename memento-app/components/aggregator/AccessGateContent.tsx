'use client';

/**
 * AccessGateContent - The actual payment wall content
 * This component uses wallet hooks and should only be rendered on client side
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useX402 } from '@/lib/hooks/use-x402';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowRight, Loader2, AlertCircle, CheckCircle2, Sparkles, Clock, ExternalLink } from 'lucide-react';
import Image from 'next/image';

// Premium countdown timer component
function PremiumCountdown({ expiresAt }: { expiresAt: string | null }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-black text-white px-5 py-3 flex items-center gap-4 shadow-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium tracking-wide">Premium</span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-1.5 font-mono text-sm">
          <Clock className="w-3.5 h-3.5 text-white/60" />
          <span className="tabular-nums">
            {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

interface AccessGateContentProps {
  children: React.ReactNode;
}

export function AccessGateContent({ children }: AccessGateContentProps) {
  const { checkAccess, requestAccess, isLoading, error, isConnected, publicKey } = useX402();
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [isConnecting, setIsConnecting] = useState(false);
  
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

  // User has access - show countdown timer
  if (hasAccess) {
    return (
      <>
        <PremiumCountdown expiresAt={expiresAt} />
        {children}
      </>
    );
  }

  // Access gate - Premium redesign
  return (
    <>
      <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-primary/20" />
        
        {/* Subtle grain texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='4' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-24">
          <div className="max-w-5xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.a
                  href="https://memento.money"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 mb-8 group"
                >
                  <Image
                    src="/transparentlogo.png"
                    alt="Memento"
                    width={48}
                    height={48}
                    className="w-12 h-12 invert"
                  />
                  <span className="font-serif text-xl text-white/60 group-hover:text-white transition-colors">
                    memento.money
                  </span>
                </motion.a>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.95] mb-4"
                >
                  Memento
                  <br />
                  <span className="font-serif italic font-normal text-white/40">Aggregator</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg sm:text-xl text-white/50 mb-8 max-w-md"
                >
                  Unlock the full yield aggregator with AI-curated opportunities across 100+ protocols.
                </motion.p>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3 mb-8"
                >
                  {[
                    'All yield opportunities',
                    'Safe & Degen filtering',
                    'Real-time APY data',
                    'AI-curated selection',
                  ].map((feature, i) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right: Payment Card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="bg-white text-black p-8 sm:p-10 shadow-2xl">
                  {/* Price */}
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-6xl sm:text-7xl font-black tracking-tight">$5</span>
                    <span className="text-2xl font-semibold text-black/50 mb-2">USDC</span>
                  </div>
                  <div className="flex items-center gap-2 mb-8">
                    <span className="text-lg text-black/60">for</span>
                    <span className="text-lg font-semibold text-primary">24 hours</span>
                    <span className="text-lg text-black/60">of premium access</span>
                  </div>

                  {/* CTA Button */}
                  {!isConnected ? (
                    <motion.button
                      onClick={() => setVisible(true)}
                      className="w-full group relative overflow-hidden text-lg px-8 py-5 bg-black text-white font-semibold transition-all duration-300 mb-6"
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
                    <div className="space-y-3 mb-6">
                      <motion.button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={isLoading}
                        className="w-full group relative overflow-hidden text-lg px-8 py-5 bg-black text-white font-semibold transition-all duration-300 disabled:opacity-50"
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
                              Unlock Now
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
                      
                      {/* Connected wallet info */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2">
                          {wallet.wallet?.adapter.icon && (
                            <Image
                              src={wallet.wallet.adapter.icon}
                              alt={wallet.wallet.adapter.name}
                              width={20}
                              height={20}
                              className="w-5 h-5"
                            />
                          )}
                          <span className="text-sm font-mono text-black/70">
                            {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                          </span>
                        </div>
                        <button
                          onClick={() => setVisible(true)}
                          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                          Switch
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-6 flex items-center justify-center gap-2 text-red-600 text-sm"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </motion.div>
                  )}

                  {/* Third-party wallet warning */}
                  <div className="p-4 bg-amber-50 border border-amber-100">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-amber-800 mb-1">
                          Third-Party Wallet Compatibility
                        </p>
                        <p className="text-amber-700 mb-2">
                          Some wallets (Phantom, Solflare) modify transactions for security, which may cause x402 payment issues. 
                          Use <span className="font-semibold">Backpack</span> for best results.
                        </p>
                        <a 
                          href="https://github.com/coinbase/x402/issues/828" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 underline"
                        >
                          View x402 Issue #828
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <p className="mt-6 text-center text-xs text-black/40">
                    Powered by x402 protocol • Instant access after payment
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
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
