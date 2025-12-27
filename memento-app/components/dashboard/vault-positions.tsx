"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { UserPosition } from "@/lib/hooks/use-vault";
import { MiniRewardCounter } from "@/components/vaults/reward-counter";

interface VaultPositionsProps {
  positions: UserPosition[];
  onClaim: (vaultId: string) => void;
  onWithdraw: (vaultId: string) => void;
}

export function VaultPositions({ positions, onClaim, onWithdraw }: VaultPositionsProps) {
  if (positions.length === 0) {
    return (
      <div className="bg-white border border-black/5 p-8 text-center">
        <p className="text-black/50">No active positions</p>
        <a
          href="/vaults"
          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-2"
        >
          Go to Vaults
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black/5 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black/5 bg-gray-50/50">
        <h3 className="font-semibold">Active Positions</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs text-black/40 uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Vault</th>
              <th className="px-6 py-3 font-medium">Deposited</th>
              <th className="px-6 py-3 font-medium">APY</th>
              <th className="px-6 py-3 font-medium">Pending</th>
              <th className="px-6 py-3 font-medium">Total Claimed</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, index) => (
              <motion.tr
                key={position.vaultId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-black/5 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold">{position.vaultName}</p>
                    <p className="text-xs text-black/40">
                      Since {new Date(position.depositedAt).toLocaleDateString()}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono font-semibold">
                    ${position.depositAmount.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-black font-medium">
                    {position.currentApy.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <MiniRewardCounter
                    depositAmount={position.depositAmount}
                    apyPercent={position.currentApy}
                    lastClaimAt={new Date(position.lastClaimAt)}
                  />
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-black/70">
                    ${position.totalClaimed.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onClaim(position.vaultId)}
                      className="px-3 py-1.5 bg-black text-white text-xs font-semibold hover:bg-black/90 transition-colors"
                    >
                      Claim
                    </button>
                    <button
                      onClick={() => onWithdraw(position.vaultId)}
                      className="px-3 py-1.5 border border-black/10 text-xs font-semibold hover:bg-black/5 transition-colors"
                    >
                      Withdraw
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

