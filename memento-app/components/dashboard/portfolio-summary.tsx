"use client";

import { motion } from "framer-motion";
import { Wallet, Clock, TrendingUp } from "lucide-react";
import Image from "next/image";
import { UserData } from "@/lib/hooks/use-vault";

interface PortfolioSummaryProps {
  userData: UserData;
}

export function PortfolioSummary({ userData }: PortfolioSummaryProps) {
  const { totals } = userData;

  // Calculate total earnings (claimed + pending)
  const totalEarnings = totals.totalClaimed + totals.pendingRewards;

  // Calculate ROI if there's a deposit
  const roi = totals.deposited > 0 ? (totalEarnings / totals.deposited) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Deposited */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="bg-white border border-black/5 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm text-black/50">Total Deposited</span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/cryptologo/USDC.png"
            alt="USDC"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <p className="text-3xl font-bold font-mono">
            {totals.deposited.toFixed(2)}
          </p>
        </div>
        <p className="text-xs text-black/40 mt-1">
          Across {userData.positions.length} vault{userData.positions.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* Pending Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white border border-black/5 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-black/10 flex items-center justify-center">
            <Image
              src="/cryptologo/USDC.png"
              alt="USDC"
              width={20}
              height={20}
              className="w-5 h-5"
            />
          </div>
          <span className="text-sm text-black/50">Pending Rewards</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold font-mono">
            +{totals.pendingRewards.toFixed(4)}
          </p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
          <p className="text-xs text-black/40">Streaming</p>
        </div>
      </motion.div>

      {/* Total Claimed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-black/5 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm text-black/50">Total Claimed</span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/cryptologo/USDC.png"
            alt="USDC"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <p className="text-3xl font-bold font-mono">
            {totals.totalClaimed.toFixed(2)}
          </p>
        </div>
        <p className="text-xs text-black/40 mt-1">
          Lifetime earnings
        </p>
      </motion.div>

      {/* ROI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white border border-black/5 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm text-black/50">Total Return</span>
        </div>
        <p className="text-3xl font-bold font-mono">
          {roi > 0 ? "+" : ""}{roi.toFixed(2)}%
        </p>
        <p className="text-xs text-black/40 mt-1">
          ${totalEarnings.toFixed(4)} earned
        </p>
      </motion.div>
    </div>
  );
}
