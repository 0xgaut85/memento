"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, AlertCircle, ExternalLink } from "lucide-react";
import { UserPosition } from "@/lib/hooks/use-vault";
import { withdrawFromVault } from "@/lib/hooks/use-vault";

interface WithdrawModalProps {
  vaultId: string;
  vaultName: string;
  position: UserPosition;
  userAddress: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FEE_PERCENT = 1.5;

type Step = "input" | "processing" | "success" | "error";

export function WithdrawModal({
  vaultId,
  vaultName,
  position,
  userAddress,
  isOpen,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [txSignature, setTxSignature] = useState("");

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep("input");
      setAmount("");
      setError("");
      setTxSignature("");
    }
  }, [isOpen]);

  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * (FEE_PERCENT / 100);
  const netWithdraw = numAmount - fee;
  const canWithdraw = numAmount > 0 && numAmount <= position.depositAmount;

  const handleWithdraw = async () => {
    try {
      setStep("processing");
      setError("");

      const result = await withdrawFromVault(vaultId, userAddress, numAmount);

      if (result.success) {
        setTxSignature(result.data.txSignature);
        setStep("success");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(result.error || "Withdrawal failed");
        setStep("error");
      }
    } catch (e) {
      console.error("Withdraw error:", e);
      setError(e instanceof Error ? e.message : "Withdrawal failed");
      setStep("error");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={step === "input" || step === "error" ? onClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-md shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-black/5">
            <div>
              <h2 className="text-xl font-bold">Withdraw from Vault</h2>
              <p className="text-sm text-black/50">{vaultName}</p>
            </div>
            {(step === "input" || step === "error") && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {step === "input" && (
              <div className="space-y-6">
                {/* Current Position */}
                <div className="bg-gray-50 p-4">
                  <p className="text-sm text-black/50 mb-1">Your Deposit</p>
                  <p className="text-2xl font-bold font-mono">
                    ${position.depositAmount.toFixed(2)}
                  </p>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="text-sm text-black/50 mb-2 block">
                    Withdraw Amount (USDC)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full text-3xl font-mono font-bold p-4 bg-gray-50 border border-black/10 focus:border-black/30 focus:outline-none"
                    />
                    <button
                      onClick={() => setAmount(position.depositAmount.toString())}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-black/50 hover:text-black px-2 py-1 bg-white border border-black/10"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Fee Breakdown */}
                {numAmount > 0 && (
                  <div className="bg-gray-50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-black/50">Withdraw Amount</span>
                      <span className="font-mono">${numAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/50">Fee ({FEE_PERCENT}%)</span>
                      <span className="font-mono text-red-500">-${fee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-black/10 pt-2 flex justify-between font-semibold">
                      <span>You Receive</span>
                      <span className="font-mono text-emerald-600">${netWithdraw.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Info */}
                <p className="text-xs text-black/40">
                  Withdrawal will be sent directly to your connected wallet.
                </p>

                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={!canWithdraw}
                  className={`w-full py-4 font-semibold transition-colors ${
                    canWithdraw
                      ? "bg-black text-white hover:bg-black/90"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Withdraw ${numAmount.toFixed(2)} USDC
                </button>
              </div>
            )}

            {step === "processing" && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-black/30" />
                <p className="font-semibold">Processing Withdrawal</p>
                <p className="text-sm text-black/50 mt-1">
                  This may take a few seconds...
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-semibold text-emerald-600">Withdrawal Successful!</p>
                <p className="text-sm text-black/50 mt-1">
                  ${netWithdraw.toFixed(2)} USDC sent to your wallet
                </p>
                {txSignature && (
                  <a
                    href={`https://solscan.io/tx/${txSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-black/40 hover:text-black mt-4"
                  >
                    View on Solscan
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {step === "error" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="font-semibold text-red-600">Withdrawal Failed</p>
                <p className="text-sm text-black/50 mt-1">{error}</p>
                <button
                  onClick={() => setStep("input")}
                  className="mt-4 px-6 py-2 bg-black text-white font-semibold hover:bg-black/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

