"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Wallet, DollarSign, ArrowUpRight, Lock } from "lucide-react";
import { Vault, UserPosition } from "@/lib/hooks/use-vault";
import { ApyDisplay } from "./apy-display";
import { RewardCounter } from "./reward-counter";

interface VaultCardProps {
  vault: Vault;
  userPosition?: UserPosition | null;
  onDeposit: () => void;
  onWithdraw: () => void;
  onClaim: () => void;
  isConnected: boolean;
}

/**
 * VaultCard - Premium vault display with all stats and actions
 */
export function VaultCard({
  vault,
  userPosition,
  onDeposit,
  onWithdraw,
  onClaim,
  isConnected,
}: VaultCardProps) {
  const isAtCapacity = vault.capacityPercent >= 100;
  const hasDeposit = userPosition && userPosition.depositAmount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-black/5 shadow-lg shadow-black/5 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-black/30">#{vault.id}</span>
              {isAtCapacity && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-200/50">
                  At Capacity
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {vault.name}
            </h3>
            <p className="text-black/50 text-sm leading-relaxed max-w-lg">
              {vault.description}
            </p>
          </div>

          {/* APY Display */}
          <div className="text-right shrink-0">
            <ApyDisplay
              apyMin={vault.apyMin}
              apyMax={vault.apyMax}
              currentApy={vault.currentApy}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-black/5">
        <StatBox
          icon={<DollarSign className="w-4 h-4" />}
          label="Total Value Locked"
          value={`$${formatNumber(vault.tvl)}`}
          subValue={`of $${formatNumber(vault.maxTvl)} max`}
        />
        <StatBox
          icon={<Users className="w-4 h-4" />}
          label="Depositors"
          value={vault.depositors.toString()}
        />
        <StatBox
          icon={<TrendingUp className="w-4 h-4" />}
          label="Total Rewards Paid"
          value={`$${formatNumber(vault.totalRewardsPaid)}`}
        />
        <StatBox
          icon={<Wallet className="w-4 h-4" />}
          label="Vault Balance"
          value={`$${formatNumber(vault.vaultBalance)}`}
          subValue="Available"
        />
      </div>

      {/* Capacity Bar */}
      <div className="px-6 sm:px-8 py-4 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-black/50">Capacity</span>
          <span className="font-mono font-medium">{vault.capacityPercent}%</span>
        </div>
        <div className="h-2 bg-black/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(vault.capacityPercent, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              vault.capacityPercent >= 90
                ? "bg-amber-500"
                : vault.capacityPercent >= 70
                ? "bg-yellow-500"
                : "bg-emerald-500"
            }`}
          />
        </div>
      </div>

      {/* User Position (if connected and has deposit) */}
      {isConnected && hasDeposit && userPosition && (
        <div className="p-6 sm:p-8 bg-gradient-to-b from-emerald-50/50 to-white border-t border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-emerald-700">Your Position</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Deposit Amount */}
            <div>
              <p className="text-xs text-black/40 mb-1">Deposited</p>
              <p className="text-2xl font-bold font-mono">
                ${userPosition.depositAmount.toFixed(2)}
              </p>
              <p className="text-xs text-black/40 mt-1">
                Max: ${vault.maxPerUser.toLocaleString()}
              </p>
            </div>

            {/* Streaming Rewards */}
            <div>
              <RewardCounter
                depositAmount={userPosition.depositAmount}
                apyPercent={userPosition.currentApy}
                lastClaimAt={new Date(userPosition.lastClaimAt)}
                totalClaimed={userPosition.totalClaimed}
                size="md"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClaim}
              className="flex-1 bg-emerald-600 text-white py-3 font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              Claim Rewards
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onWithdraw}
              className="flex-1 bg-white border border-black/10 py-3 font-semibold hover:bg-black/5 transition-colors"
            >
              Withdraw
            </button>
          </div>
        </div>
      )}

      {/* Action Area (if connected but no deposit, or not connected) */}
      {(!hasDeposit || !isConnected) && (
        <div className="p-6 sm:p-8 border-t border-black/5">
          {isConnected ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onDeposit}
                disabled={isAtCapacity}
                className={`flex-1 py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isAtCapacity
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-black/90"
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
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="text-center sm:text-left">
                <p className="text-xs text-black/40">
                  Max deposit: ${vault.maxPerUser.toLocaleString()} per user
                </p>
                <p className="text-xs text-black/40">
                  1.5% fee on deposit & withdrawal
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-black/50 text-sm mb-2">
                Connect your wallet to deposit
              </p>
              <p className="text-xs text-black/30">
                Earn {vault.apyMin}–{vault.apyMax}% APY on your USDC
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Helper component for stat boxes
function StatBox({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 text-black/40 mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg sm:text-xl font-bold font-mono">{value}</p>
      {subValue && <p className="text-xs text-black/40 mt-0.5">{subValue}</p>}
    </div>
  );
}

// Format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toFixed(2);
}

