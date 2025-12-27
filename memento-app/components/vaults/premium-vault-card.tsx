"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, ArrowUpRight, Lock, Sparkles } from "lucide-react";
import { Vault, UserPosition } from "@/lib/hooks/use-vault";
import Image from "next/image";

interface PremiumVaultCardProps {
  vault: Vault;
  userPosition?: UserPosition | null;
  onDeposit: () => void;
  onWithdraw: () => void;
  onClaim: () => void;
  isConnected: boolean;
  index: number;
}

// Vault illustration placeholders - ask designer to create these
const VAULT_IMAGES: Record<string, string> = {
  "01": "/vaults/vault-01-dividend.png",
  "02": "/vaults/vault-02-basis.png",
  "03": "/vaults/vault-03-reits.png",
  "04": "/vaults/vault-04-rwa.png",
};

// Gradient variations for each vault
const VAULT_GRADIENTS: Record<string, string> = {
  "01": "from-rose-100/80 via-pink-50/60 to-transparent",
  "02": "from-violet-100/80 via-purple-50/60 to-transparent",
  "03": "from-amber-100/80 via-orange-50/60 to-transparent",
  "04": "from-emerald-100/80 via-teal-50/60 to-transparent",
};

/**
 * PremiumVaultCard - Highly premium vault display with pastel gradient and illustration
 */
export function PremiumVaultCard({
  vault,
  userPosition,
  onDeposit,
  onWithdraw,
  onClaim,
  isConnected,
  index,
}: PremiumVaultCardProps) {
  const isAtCapacity = vault.capacityPercent >= 100;
  const hasDeposit = userPosition && userPosition.depositAmount > 0;
  const gradientClass = VAULT_GRADIENTS[vault.id] || VAULT_GRADIENTS["01"];
  const imagePath = VAULT_IMAGES[vault.id] || VAULT_IMAGES["01"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative aspect-square bg-white overflow-hidden border border-black/5 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500"
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15] z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
        }}
      />

      {/* Pastel gradient - covers 1/3 from left */}
      <div
        className={`absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r ${gradientClass} z-0`}
      />

      {/* Background illustration placeholder */}
      <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
        <div className="absolute right-0 bottom-0 w-2/3 h-2/3 flex items-end justify-end">
          {/* Placeholder for designer illustration */}
          <div className="w-full h-full bg-gradient-to-tl from-black/5 to-transparent flex items-center justify-center">
            <span className="text-xs text-black/20 font-mono rotate-12">
              {imagePath.replace("/vaults/", "").replace(".png", "")}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-auto">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono text-black/30 tracking-wider">
                VAULT #{vault.id}
              </span>
              {isAtCapacity && (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5">
                  FULL
                </span>
              )}
              {hasDeposit && (
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  ACTIVE
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-black mb-2 leading-tight">
              {vault.name}
            </h3>
            <p className="text-sm text-black/50 leading-relaxed line-clamp-2 max-w-[90%]">
              {vault.description}
            </p>
          </div>
        </div>

        {/* APY Display - Premium Style */}
        <div className="my-6">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-black">
              {vault.currentApy.toFixed(1)}
            </span>
            <span className="text-2xl font-bold text-black/60">%</span>
          </div>
          <p className="text-xs text-black/40 mt-1 font-medium tracking-wide">
            APY • Range {vault.apyMin}–{vault.apyMax}%
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-black/[0.03] p-3">
            <div className="flex items-center gap-1.5 text-black/40 mb-1">
              <DollarSign className="w-3 h-3" />
              <span className="text-[10px] font-medium tracking-wide">TVL</span>
            </div>
            <p className="text-sm font-bold font-mono text-black">
              ${formatCompact(vault.tvl)}
            </p>
          </div>
          <div className="bg-black/[0.03] p-3">
            <div className="flex items-center gap-1.5 text-black/40 mb-1">
              <Users className="w-3 h-3" />
              <span className="text-[10px] font-medium tracking-wide">DEPOSITORS</span>
            </div>
            <p className="text-sm font-bold font-mono text-black">
              {vault.depositors}
            </p>
          </div>
          <div className="bg-black/[0.03] p-3">
            <div className="flex items-center gap-1.5 text-black/40 mb-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-[10px] font-medium tracking-wide">PAID</span>
            </div>
            <p className="text-sm font-bold font-mono text-black">
              ${formatCompact(vault.totalRewardsPaid)}
            </p>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-[10px] mb-1.5">
            <span className="text-black/40 font-medium tracking-wide">CAPACITY</span>
            <span className="font-mono font-bold text-black">{vault.capacityPercent}%</span>
          </div>
          <div className="h-1.5 bg-black/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(vault.capacityPercent, 100)}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.1 }}
              className={`h-full ${
                vault.capacityPercent >= 90
                  ? "bg-amber-500"
                  : vault.capacityPercent >= 70
                  ? "bg-yellow-500"
                  : "bg-black"
              }`}
            />
          </div>
        </div>

        {/* User Position (if has deposit) */}
        {isConnected && hasDeposit && userPosition && (
          <div className="bg-emerald-50/80 border border-emerald-100 p-4 mb-4 -mx-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-emerald-700 tracking-wide">
                YOUR POSITION
              </span>
              <span className="text-lg font-bold font-mono text-emerald-700">
                ${userPosition.depositAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-600/70">Pending rewards</span>
              <span className="font-mono font-semibold text-emerald-600">
                +${userPosition.pendingRewards.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto">
          {isConnected ? (
            hasDeposit ? (
              <div className="flex gap-2">
                <button
                  onClick={onClaim}
                  className="flex-1 bg-emerald-600 text-white py-3 font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Claim
                </button>
                <button
                  onClick={onWithdraw}
                  className="flex-1 bg-white border border-black/10 py-3 font-semibold text-sm hover:bg-black/5 transition-colors"
                >
                  Withdraw
                </button>
                <button
                  onClick={onDeposit}
                  disabled={isAtCapacity}
                  className="flex-1 bg-black text-white py-3 font-semibold text-sm hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add
                </button>
              </div>
            ) : (
              <button
                onClick={onDeposit}
                disabled={isAtCapacity}
                className={`w-full py-4 font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isAtCapacity
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-black/90 group-hover:shadow-lg"
                }`}
              >
                {isAtCapacity ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Vault Full
                  </>
                ) : (
                  <>
                    Deposit USDC
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
            )
          ) : (
            <div className="text-center py-3 bg-black/[0.02]">
              <p className="text-sm text-black/40">
                Connect wallet to deposit
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Format numbers compactly
function formatCompact(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  if (num >= 1) {
    return num.toFixed(0);
  }
  return num.toFixed(2);
}

