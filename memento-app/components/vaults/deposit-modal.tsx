"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from "@solana/spl-token";
import { Vault } from "@/lib/hooks/use-vault";
import { depositToVault } from "@/lib/hooks/use-vault";

interface DepositModalProps {
  vault: Vault;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  maxDeposit: number; // User's remaining deposit capacity
}

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const FEE_PERCENT = 1.5;

type Step = "input" | "confirm" | "sending" | "verifying" | "success" | "error";

export function DepositModal({
  vault,
  isOpen,
  onClose,
  onSuccess,
  maxDeposit,
}: DepositModalProps) {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  const [step, setStep] = useState<Step>("input");
  const [amount, setAmount] = useState("");
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch USDC balance
  useEffect(() => {
    if (!publicKey || !isOpen) return;

    const fetchBalance = async () => {
      try {
        const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);
        const account = await getAccount(connection, ata);
        setUsdcBalance(Number(account.amount) / 1_000_000);
      } catch {
        setUsdcBalance(0);
      }
    };

    fetchBalance();
  }, [publicKey, connection, isOpen]);

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
  const netDeposit = numAmount - fee;
  const totalToSend = numAmount;

  const canDeposit =
    numAmount > 0 &&
    numAmount <= (usdcBalance || 0) &&
    netDeposit <= maxDeposit &&
    netDeposit <= vault.maxTvl - vault.tvl;

  const handleDeposit = async () => {
    if (!publicKey || !signTransaction) return;

    try {
      setStep("sending");
      setError("");

      // Build transaction
      const userAta = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const vaultPubkey = new PublicKey(vault.treasuryAddress);
      const vaultAta = await getAssociatedTokenAddress(USDC_MINT, vaultPubkey);

      const amountMicro = Math.floor(totalToSend * 1_000_000);

      const transaction = new Transaction().add(
        createTransferInstruction(userAta, vaultAta, publicKey, amountMicro)
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send
      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());

      setTxSignature(signature);
      setStep("verifying");

      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      // Verify with backend
      const result = await depositToVault(
        vault.id,
        signature,
        publicKey.toString(),
        totalToSend
      );

      if (result.success) {
        setStep("success");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(result.error || "Deposit verification failed");
        setStep("error");
      }
    } catch (e) {
      console.error("Deposit error:", e);
      setError(e instanceof Error ? e.message : "Transaction failed");
      setStep("error");
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(vault.treasuryAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <h2 className="text-xl font-bold">Deposit to Vault</h2>
              <p className="text-sm text-black/50">{vault.name}</p>
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
                {/* Amount Input */}
                <div>
                  <label className="text-sm text-black/50 mb-2 block">
                    Amount (USDC)
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
                      onClick={() => setAmount(Math.min(usdcBalance || 0, maxDeposit).toString())}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-black/50 hover:text-black px-2 py-1 bg-white border border-black/10"
                    >
                      MAX
                    </button>
                  </div>
                  {usdcBalance !== null && (
                    <p className="text-xs text-black/40 mt-2">
                      Balance: {usdcBalance.toFixed(2)} USDC
                    </p>
                  )}
                </div>

                {/* Fee Breakdown */}
                {numAmount > 0 && (
                  <div className="bg-gray-50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-black/50">Amount</span>
                      <span className="font-mono">${numAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/50">Fee ({FEE_PERCENT}%)</span>
                      <span className="font-mono text-red-500">-${fee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-black/10 pt-2 flex justify-between font-semibold">
                      <span>Net Deposit</span>
                      <span className="font-mono">${netDeposit.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Vault Address */}
                <div>
                  <label className="text-sm text-black/50 mb-2 block">
                    Vault Treasury Address
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 border border-black/10">
                    <code className="flex-1 text-xs font-mono truncate">
                      {vault.treasuryAddress}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-1.5 hover:bg-black/5 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-black/40" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Limits Info */}
                <div className="text-xs text-black/40 space-y-1">
                  <p>• Max deposit per user: ${vault.maxPerUser.toLocaleString()}</p>
                  <p>• Your remaining capacity: ${maxDeposit.toFixed(2)}</p>
                  <p>• Vault remaining capacity: ${(vault.maxTvl - vault.tvl).toFixed(2)}</p>
                </div>

                {/* Deposit Button */}
                <button
                  onClick={handleDeposit}
                  disabled={!canDeposit}
                  className={`w-full py-4 font-semibold transition-colors ${
                    canDeposit
                      ? "bg-black text-white hover:bg-black/90"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Deposit ${numAmount.toFixed(2)} USDC
                </button>
              </div>
            )}

            {step === "sending" && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-black/30" />
                <p className="font-semibold">Sending Transaction</p>
                <p className="text-sm text-black/50 mt-1">
                  Please approve in your wallet...
                </p>
              </div>
            )}

            {step === "verifying" && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-emerald-500" />
                <p className="font-semibold">Verifying Deposit</p>
                <p className="text-sm text-black/50 mt-1">
                  Confirming on Solana...
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

            {step === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-semibold text-emerald-600">Deposit Successful!</p>
                <p className="text-sm text-black/50 mt-1">
                  ${netDeposit.toFixed(2)} USDC deposited to vault
                </p>
              </div>
            )}

            {step === "error" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="font-semibold text-red-600">Deposit Failed</p>
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

