"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface RewardCounterProps {
  depositAmount: number;
  apyPercent: number;
  lastClaimAt: Date;
  totalClaimed?: number;
  size?: "sm" | "md" | "lg";
}

/**
 * RewardCounter - Real-time streaming reward display
 * Updates every 100ms to show rewards accumulating in real-time
 */
export function RewardCounter({
  depositAmount,
  apyPercent,
  lastClaimAt,
  totalClaimed = 0,
  size = "md",
}: RewardCounterProps) {
  const [pendingRewards, setPendingRewards] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const calculateRewards = () => {
      const now = Date.now();
      const msElapsed = now - lastClaimAt.getTime();
      const yearsElapsed = msElapsed / (365.25 * 24 * 60 * 60 * 1000);
      
      // Simple interest: amount * (apy/100) * time
      const rewards = depositAmount * (apyPercent / 100) * yearsElapsed;
      setPendingRewards(Math.max(0, rewards));
    };

    // Initial calculation
    calculateRewards();

    // Update every 100ms for smooth streaming effect
    const interval = setInterval(calculateRewards, 100);

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [depositAmount, apyPercent, lastClaimAt]);

  const sizeClasses = {
    sm: { value: "text-lg", label: "text-xs", icon: 14 },
    md: { value: "text-2xl", label: "text-sm", icon: 18 },
    lg: { value: "text-4xl", label: "text-base", icon: 24 },
  };

  // Format with many decimal places for streaming effect
  const formatReward = (value: number) => {
    if (value < 0.0001) return "0.000000";
    if (value < 0.01) return value.toFixed(6);
    if (value < 1) return value.toFixed(4);
    return value.toFixed(2);
  };

  // Calculate daily rate for display
  const dailyRate = depositAmount * (apyPercent / 100) / 365.25;

  return (
    <div className="space-y-2">
      {/* Pending Rewards */}
      <div>
        <div className="flex items-center gap-2">
          <motion.span
            key={formatReward(pendingRewards)}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className={`font-mono font-bold tabular-nums text-black ${sizeClasses[size].value}`}
          >
            +{formatReward(pendingRewards)}
          </motion.span>
          <Image
            src="/cryptologo/USDC.png"
            alt="USDC"
            width={sizeClasses[size].icon}
            height={sizeClasses[size].icon}
            className="shrink-0 rounded-full"
          />
        </div>
        <p className={`text-black/40 ${sizeClasses[size].label}`}>
          Pending rewards
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-black/50">
        <div>
          <span className="text-black/70 font-medium">${dailyRate.toFixed(4)}</span>
          <span className="ml-1">/ day</span>
        </div>
        {totalClaimed > 0 && (
          <div>
            <span className="text-black/70 font-medium">${totalClaimed.toFixed(2)}</span>
            <span className="ml-1">claimed</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MiniRewardCounter - Compact version for table rows
 */
export function MiniRewardCounter({
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

  return (
    <span className="font-mono text-black font-medium tabular-nums flex items-center gap-1">
      +{pendingRewards < 0.01 ? pendingRewards.toFixed(4) : pendingRewards.toFixed(2)}
      <Image
        src="/cryptologo/USDC.png"
        alt="USDC"
        width={12}
        height={12}
        className="w-3 h-3 rounded-full"
      />
    </span>
  );
}
