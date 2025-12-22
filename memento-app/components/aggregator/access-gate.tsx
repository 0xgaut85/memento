'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useX402 } from '@/lib/hooks/use-x402';
import { Wallet, Lock, Unlock, Clock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface AccessGateProps {
  children: React.ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const { checkAccess, requestAccess, isLoading, error, isConnected, publicKey } = useX402();
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
    setPaymentMessage('Preparing payment...');

    const result = await requestAccess('human');

    if (result.success && result.accessGranted) {
      setPaymentStatus('success');
      setPaymentMessage(result.message || 'Access granted! Enjoy the aggregator.');
      setHasAccess(true);
      setExpiresAt(result.expiresAt || null);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentStatus('idle');
      }, 2000);
    } else {
      setPaymentStatus('error');
      setPaymentMessage(result.error || 'Payment failed. Please try again.');
    }
  };

  // If still checking access, show loading
  if (hasAccess === null && isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // If user has access, show the aggregator
  if (hasAccess) {
    return (
      <>
        {/* Access Banner */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-emerald-100 border border-emerald-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
            <Unlock className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-800">
              Access active
              {remainingHours !== null && ` • ${remainingHours}h remaining`}
            </span>
          </div>
        </div>
        {children}
      </>
    );
  }

  // If not connected or no access, show gate
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-8 py-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Image
                    src="/transparentlogo.png"
                    alt="Memento"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-pink-500 rounded-full p-1.5">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Premium Access Required
              </h2>
              <p className="text-gray-600">
                Get 24-hour access to the Stablecoin Yield Aggregator
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Price */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">One-time payment</p>
                <p className="text-3xl font-bold text-gray-900">$5 USDC</p>
                <p className="text-sm text-gray-500 mt-1">24 hours of unlimited access</p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Access all stablecoin yield opportunities</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Safe & Degen mode filtering</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Real-time APY & TVL data</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>Access valid for 24 hours</span>
                </div>
              </div>

              {/* Action Button */}
              {!isConnected ? (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">Connect your wallet to continue</p>
                  <button
                    onClick={() => {
                      // Trigger wallet connect via Reown AppKit
                      const event = new CustomEvent('open-wallet-modal');
                      window.dispatchEvent(event);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pink-200 text-pink-800 hover:bg-pink-300 rounded-xl font-medium transition-colors"
                  >
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5" />
                      Unlock Access for $5 USDC
                    </>
                  )}
                </button>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => paymentStatus !== 'processing' && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-6 text-center">
                {paymentStatus === 'processing' && (
                  <>
                    <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                    <p className="text-gray-600 text-sm">{paymentMessage}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      Please approve the transaction in your wallet
                    </p>
                  </>
                )}

                {paymentStatus === 'success' && (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Access Granted!</h3>
                    <p className="text-gray-600 text-sm">{paymentMessage}</p>
                  </>
                )}

                {paymentStatus === 'error' && (
                  <>
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
                    <p className="text-gray-600 text-sm">{paymentMessage}</p>
                    <button
                      onClick={() => {
                        setPaymentStatus('idle');
                        handleRequestAccess();
                      }}
                      className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </>
                )}

                {paymentStatus === 'idle' && (
                  <>
                    <Image
                      src="/transparentlogo.png"
                      alt="Memento"
                      width={48}
                      height={48}
                      className="w-12 h-12 mx-auto mb-4"
                    />
                    <h3 className="text-lg font-semibold mb-2">Confirm Payment</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      You are about to pay <strong>$5 USDC</strong> for 24-hour access to the aggregator.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRequestAccess}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors"
                      >
                        Pay $5 USDC
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}





