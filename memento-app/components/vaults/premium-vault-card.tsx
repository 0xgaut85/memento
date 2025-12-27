"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, ArrowUpRight, Lock } from "lucide-react";
import { Vault, UserPosition } from "@/lib/hooks/use-vault";
import Image from "next/image";
import { PlatformCarousel, VAULT_PLATFORMS } from "./platform-carousel";

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

// Check if vault is coming soon
const isComingSoon = (vaultId: string) => vaultId === "04";

/**
 * Streaming USDC Counter - Real-time reward display
 */
function StreamingRewards({
  depositAmount,
  apyPercent,
  lastClaimAt,
}: {
  depositAmount: number;
  apyPercent: number;
  lastClaimAt: Date;
}) {
  const [pendingRewards, setPendingRewards] = useState(0);

  useEffect(() => {
    const calculateRewards = () => {
      const now = Date.now();
      const msElapsed = now - lastClaimAt.getTime();
      const yearsElapsed = msElapsed / (365.25 * 24 * 60 * 60 * 1000);
      const rewards = depositAmount * (apyPercent / 100) * yearsElapsed;
      setPendingRewards(Math.max(0, rewards));
    };

    calculateRewards();
    const interval = setInterval(calculateRewards, 100);
    return () => clearInterval(interval);
  }, [depositAmount, apyPercent, lastClaimAt]);

  const formatReward = (value: number) => {
    if (value < 0.0001) return "0.000000";
    if (value < 0.01) return value.toFixed(6);
    if (value < 1) return value.toFixed(4);
    return value.toFixed(2);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono font-semibold text-black tabular-nums">
        +{formatReward(pendingRewards)}
      </span>
      <Image
        src="/cryptologo/USDC.png"
        alt="USDC"
        width={16}
        height={16}
        className="w-4 h-4 rounded-full"
      />
    </div>
  );
}

/**
 * Mini APY Chart - Shows APY evolution
 */
function ApyChart({ apyMin, apyMax, currentApy }: { apyMin: number; apyMax: number; currentApy: number }) {
  // Generate fake historical data points for visual effect
  const points = Array.from({ length: 12 }, (_, i) => {
    const base = (apyMin + apyMax) / 2;
    const variance = (apyMax - apyMin) / 4;
    const noise = Math.sin(i * 0.8) * variance + Math.cos(i * 1.2) * (variance / 2);
    return Math.max(apyMin, Math.min(apyMax, base + noise));
  });
  // Add current APY as last point
  points.push(currentApy);

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  // Create SVG path
  const width = 100;
  const height = 32;
  const pathData = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8" preserveAspectRatio="none">
        {/* Gradient fill */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path
          d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
          fill="url(#chartGradient)"
        />
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Current point */}
        <circle
          cx={width}
          cy={height - ((currentApy - min) / range) * height}
          r="2.5"
          fill="black"
        />
      </svg>
      <div className="flex justify-between text-[9px] text-black/30 mt-1 font-mono">
        <span>30d ago</span>
        <span>now</span>
      </div>
    </div>
  );
}

/**
 * PremiumVaultCard - Highly premium vault display with pastel pink gradient
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
  const imagePath = VAULT_IMAGES[vault.id] || VAULT_IMAGES["01"];
  const comingSoon = isComingSoon(vault.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`group relative aspect-square bg-white overflow-hidden border border-black/5 shadow-xl shadow-black/5 ${
        comingSoon ? "opacity-60" : "hover:shadow-2xl hover:shadow-black/10"
      } transition-all duration-500`}
    >
      {/* Heavy grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
          opacity: 0.25,
          mixBlendMode: "multiply",
        }}
      />

      {/* Pastel pink gradient - covers 1/3 from left */}
      <div
        className="absolute inset-y-0 left-0 w-1/3 z-0"
        style={{
          background: "linear-gradient(to right, rgba(253, 226, 232, 0.9), rgba(252, 231, 243, 0.7), transparent)",
        }}
      />

      {/* Coming soon blur overlay */}
      {comingSoon && (
        <div className="absolute inset-0 z-30 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-black/80 text-white px-6 py-3 font-semibold text-sm tracking-wide">
            Coming Soon
          </div>
        </div>
      )}

      {/* Background illustration placeholder */}
      <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
        <div className="absolute right-0 bottom-0 w-2/3 h-2/3 flex items-end justify-end">
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
              {isAtCapacity && !comingSoon && (
                <span className="text-[10px] font-medium text-black/50 bg-black/5 px-2 py-0.5">
                  FULL
                </span>
              )}
              {hasDeposit && !comingSoon && (
                <span className="text-[10px] font-medium text-black/70 bg-black/5 px-2 py-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
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

        {/* APY Display with Chart */}
        <div className="my-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="inline-flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-black">
                  {vault.currentApy.toFixed(1)}
                </span>
                <span className="text-2xl font-bold text-black/50">%</span>
              </div>
              <p className="text-xs text-black/40 mt-1 font-medium tracking-wide">
                Current APY
              </p>
            </div>
          </div>
          {/* APY Evolution Chart */}
          <div className="mt-2">
            <ApyChart apyMin={vault.apyMin} apyMax={vault.apyMax} currentApy={vault.currentApy} />
          </div>
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
              <span className="text-[10px] font-medium tracking-wide">USERS</span>
            </div>
            <p className="text-sm font-bold font-mono text-black">
              {vault.depositors}
            </p>
          </div>
          <div className="bg-black/[0.03] p-3">
            <div className="flex items-center gap-1.5 text-black/40 mb-1">
              <Image
                src="/cryptologo/USDC.png"
                alt="USDC"
                width={12}
                height={12}
                className="w-3 h-3 rounded-full"
              />
              <span className="text-[10px] font-medium tracking-wide">PAID</span>
            </div>
            <p className="text-sm font-bold font-mono text-black">
              ${formatCompact(vault.totalRewardsPaid)}
            </p>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] mb-1.5">
            <span className="text-black/40 font-medium tracking-wide">CAPACITY</span>
            <span className="font-mono font-bold text-black">{vault.capacityPercent}%</span>
          </div>
          <div className="h-1.5 bg-black/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(vault.capacityPercent, 100)}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.1 }}
              className="h-full bg-black"
            />
          </div>
        </div>

        {/* Platform Carousel */}
        {VAULT_PLATFORMS[vault.id] && VAULT_PLATFORMS[vault.id].length > 0 && (
          <div className="mb-4 bg-black/[0.02] p-3 -mx-2">
            <PlatformCarousel platforms={VAULT_PLATFORMS[vault.id]} />
          </div>
        )}

        {/* User Position (if has deposit) */}
        {isConnected && hasDeposit && userPosition && !comingSoon && (
          <div className="bg-black/[0.03] border border-black/5 p-4 mb-4 -mx-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-black/50 tracking-wide">
                YOUR POSITION
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold font-mono text-black">
                  {userPosition.depositAmount.toFixed(2)}
                </span>
                <Image
                  src="/cryptologo/USDC.png"
                  alt="USDC"
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5 rounded-full"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-black/40">Streaming rewards</span>
              <StreamingRewards
                depositAmount={userPosition.depositAmount}
                apyPercent={userPosition.currentApy}
                lastClaimAt={new Date(userPosition.lastClaimAt)}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto">
          {comingSoon ? (
            <div className="text-center py-3 bg-black/[0.02]">
              <p className="text-sm text-black/40">
                This vault is not yet available
              </p>
            </div>
          ) : isConnected ? (
            hasDeposit ? (
              <div className="flex gap-2">
                <button
                  onClick={onClaim}
                  className="flex-1 bg-black text-white py-3 font-semibold text-sm hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
                >
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
                    ? "bg-black/10 text-black/40 cursor-not-allowed"
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
