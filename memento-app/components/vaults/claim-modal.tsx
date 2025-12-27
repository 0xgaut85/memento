"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, AlertCircle, ExternalLink, Gift } from "lucide-react";
import { UserPosition } from "@/lib/hooks/use-vault";
import { claimFromVault } from "@/lib/hooks/use-vault";

interface ClaimModalProps {
  vaultId: string;
  vaultName: string;
  position: UserPosition;
  userAddress: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "confirm" | "processing" | "success" | "error";

export function ClaimModal({
  vaultId,
  vaultName,
  position,
  userAddress,
  isOpen,
  onClose,
  onSuccess,
}: ClaimModalProps) {
  const [step, setStep] = useState<Step>("confirm");
  const [error, setError] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [claimedAmount, setClaimedAmount] = useState(0);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setError("");
      setTxSignature("");
      setClaimedAmount(0);
    }
  }, [isOpen]);

  const canClaim = position.pendingRewards >= 0.01;

  const handleClaim = async () => {
    try {
      setStep("processing");
      setError("");

      const result = await claimFromVault(vaultId, userAddress);

      if (result.success) {
        setTxSignature(result.data.txSignature);
        setClaimedAmount(result.data.amount);
        setStep("success");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(result.error || "Claim failed");
        setStep("error");
      }
    } catch (e) {
      console.error("Claim error:", e);
      setError(e instanceof Error ? e.message : "Claim failed");
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
          onClick={step === "confirm" || step === "error" ? onClose : undefined}
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
              <h2 className="text-xl font-bold">Claim Rewards</h2>
              <p className="text-sm text-black/50">{vaultName}</p>
            </div>
            {(step === "confirm" || step === "error") && (
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
            {step === "confirm" && (
              <div className="space-y-6">
                {/* Reward Display */}
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Gift className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-sm text-black/50 mb-2">Pending Rewards</p>
                  <p className="text-4xl font-bold font-mono text-emerald-600">
                    ${position.pendingRewards.toFixed(4)}
                  </p>
                </div>

                {/* Stats */}
                <div className="bg-gray-50 p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/50">Your Deposit</span>
                    <span className="font-mono">${position.depositAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black/50">Current APY</span>
                    <span className="font-mono">{position.currentApy.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black/50">Total Claimed</span>
                    <span className="font-mono">${position.totalClaimed.toFixed(2)}</span>
                  </div>
                </div>

                {/* Info */}
                <p className="text-xs text-black/40 text-center">
                  No fees on reward claims. Rewards will be sent directly to your wallet.
                </p>

                {/* Claim Button */}
                <button
                  onClick={handleClaim}
                  disabled={!canClaim}
                  className={`w-full py-4 font-semibold transition-colors ${
                    canClaim
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canClaim
                    ? `Claim $${position.pendingRewards.toFixed(4)} USDC`
                    : "Minimum claim is $0.01"}
                </button>
              </div>
            )}

            {step === "processing" && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-emerald-500" />
                <p className="font-semibold">Processing Claim</p>
                <p className="text-sm text-black/50 mt-1">
                  Sending rewards to your wallet...
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-semibold text-emerald-600">Claim Successful!</p>
                <p className="text-sm text-black/50 mt-1">
                  ${claimedAmount.toFixed(4)} USDC sent to your wallet
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
                <p className="font-semibold text-red-600">Claim Failed</p>
                <p className="text-sm text-black/50 mt-1">{error}</p>
                <button
                  onClick={() => setStep("confirm")}
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

