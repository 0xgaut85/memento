"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Gift, ExternalLink } from "lucide-react";
import { UserTransaction } from "@/lib/hooks/use-vault";

interface TransactionHistoryProps {
  transactions: UserTransaction[];
}

const typeConfig = {
  deposit: {
    icon: ArrowDownLeft,
    label: "Deposit",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  withdraw: {
    icon: ArrowUpRight,
    label: "Withdraw",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  claim: {
    icon: Gift,
    label: "Claim",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  fee: {
    icon: ArrowUpRight,
    label: "Fee",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-black/5 p-8 text-center">
        <p className="text-black/50">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black/5 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black/5 bg-gray-50/50">
        <h3 className="font-semibold">Transaction History</h3>
      </div>

      {/* List */}
      <div className="divide-y divide-black/5">
        {transactions.map((tx, index) => {
          const config = typeConfig[tx.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="px-6 py-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 ${config.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-black/30">•</span>
                    <span className="text-sm text-black/50 truncate">
                      {tx.vaultName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/40 mt-0.5">
                    <span>{new Date(tx.createdAt).toLocaleString()}</span>
                    {tx.fee && tx.fee > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-red-500">Fee: ${tx.fee.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className={`font-mono font-semibold ${
                    tx.type === "deposit" ? "text-blue-600" :
                    tx.type === "claim" ? "text-emerald-600" :
                    tx.type === "fee" ? "text-red-500" :
                    "text-black"
                  }`}>
                    {tx.type === "deposit" ? "+" : tx.type === "withdraw" || tx.type === "fee" ? "-" : "+"}
                    ${tx.amount.toFixed(tx.type === "claim" ? 4 : 2)}
                  </p>
                  <a
                    href={`https://solscan.io/tx/${tx.txSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-black/30 hover:text-black/60"
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

