"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet, TrendingUp, Clock, Shield, RefreshCw } from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PasswordGate } from "@/components/vaults/password-gate";
import { PremiumVaultCard } from "@/components/vaults/premium-vault-card";
import { DepositModal } from "@/components/vaults/deposit-modal";
import { WithdrawModal } from "@/components/vaults/withdraw-modal";
import { ClaimModal } from "@/components/vaults/claim-modal";
import { useVaults, useUserPositions, Vault, UserPosition } from "@/lib/hooks/use-vault";

export default function VaultsPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { vaults, loading, error, refetch } = useVaults();
  const { data: userData, refetch: refetchPositions } = useUserPositions(
    publicKey?.toString() || null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal state
  const [depositModal, setDepositModal] = useState<{
    isOpen: boolean;
    vault: Vault | null;
  }>({ isOpen: false, vault: null });

  const [withdrawModal, setWithdrawModal] = useState<{
    isOpen: boolean;
    vault: Vault | null;
    position: UserPosition | null;
  }>({ isOpen: false, vault: null, position: null });

  const [claimModal, setClaimModal] = useState<{
    isOpen: boolean;
    vault: Vault | null;
    position: UserPosition | null;
  }>({ isOpen: false, vault: null, position: null });

  // Get user position for a vault
  const getUserPosition = (vaultId: string): UserPosition | null => {
    return userData?.positions.find((p) => p.vaultId === vaultId) || null;
  };

  // Calculate max deposit for a vault
  const getMaxDeposit = (vault: Vault): number => {
    const position = getUserPosition(vault.id);
    const currentDeposit = position?.depositAmount || 0;
    const userRemaining = vault.maxPerUser - currentDeposit;
    const vaultRemaining = vault.maxTvl - vault.tvl;
    return Math.min(userRemaining, vaultRemaining);
  };

  // Handlers
  const handleDeposit = (vault: Vault) => {
    if (!connected) {
      setVisible(true);
      return;
    }
    setDepositModal({ isOpen: true, vault });
  };

  const handleWithdraw = (vault: Vault) => {
    const position = getUserPosition(vault.id);
    if (position) {
      setWithdrawModal({ isOpen: true, vault, position });
    }
  };

  const handleClaim = (vault: Vault) => {
    const position = getUserPosition(vault.id);
    if (position) {
      setClaimModal({ isOpen: true, vault, position });
    }
  };

  const handleSuccess = () => {
    refetch();
    refetchPositions();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), refetchPositions()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <PasswordGate storageKey="vault_access">
      <PageWrapper>
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
          >
            <div className="max-w-2xl">
              <p className="text-xs font-mono text-black/40 tracking-widest mb-3">
                MEMENTO VAULTS
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-[0.95]">
                Put Your USDC
                <br />
                <span className="text-black/40">to Work</span>
              </h1>
              <p className="text-base sm:text-lg text-black/50 leading-relaxed">
                Deposit into our curated yield strategies. Each vault runs a distinct
                approach with different risk/reward profiles.
              </p>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-sm text-black/50 hover:text-black border border-black/10 hover:border-black/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh APY
            </button>
          </motion.div>

          {/* User Stats Row */}
          {userData && userData.totals.deposited > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="bg-white border border-black/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-black/40 tracking-wider font-medium">
                      TOTAL DEPOSITED
                    </p>
                    <p className="text-2xl font-black font-mono">
                      ${userData.totals.deposited.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-black/40 tracking-wider font-medium">
                      PENDING REWARDS
                    </p>
                    <p className="text-2xl font-black font-mono text-emerald-600">
                      +${userData.totals.pendingRewards.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-black/40 tracking-wider font-medium">
                      TOTAL CLAIMED
                    </p>
                    <p className="text-2xl font-black font-mono">
                      ${userData.totals.totalClaimed.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Connect Wallet CTA */}
          {!connected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-10"
            >
              <button
                onClick={() => setVisible(true)}
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-semibold hover:bg-black/90 transition-colors"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet to Deposit
              </button>
            </motion.div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-32">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-3 bg-black text-white font-semibold hover:bg-black/90"
            >
              Retry
            </button>
          </div>
        )}

        {/* Vault Cards - 2x2 Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vaults.map((vault, index) => (
              <PremiumVaultCard
                key={vault.id}
                vault={vault}
                userPosition={getUserPosition(vault.id)}
                onDeposit={() => handleDeposit(vault)}
                onWithdraw={() => handleWithdraw(vault)}
                onClaim={() => handleClaim(vault)}
                isConnected={connected}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 p-8 bg-black/[0.02] border border-black/5"
        >
          <div className="flex items-start gap-5">
            <Shield className="w-6 h-6 text-black/20 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold mb-3 text-black/70">Important Information</h4>
              <ul className="text-sm text-black/40 space-y-1.5 leading-relaxed">
                <li>• 1.5% fee applies to deposits and withdrawals</li>
                <li>• No fees on reward claims</li>
                <li>• Maximum deposit per user: $5,000 per vault</li>
                <li>• Maximum TVL per vault: $100,000</li>
                <li>• Rewards accrue based on current APY</li>
                <li>• APY is variable and not guaranteed</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Modals */}
        {depositModal.vault && (
          <DepositModal
            vault={depositModal.vault}
            isOpen={depositModal.isOpen}
            onClose={() => setDepositModal({ isOpen: false, vault: null })}
            onSuccess={handleSuccess}
            maxDeposit={getMaxDeposit(depositModal.vault)}
          />
        )}

        {withdrawModal.vault && withdrawModal.position && publicKey && (
          <WithdrawModal
            vaultId={withdrawModal.vault.id}
            vaultName={withdrawModal.vault.name}
            position={withdrawModal.position}
            userAddress={publicKey.toString()}
            isOpen={withdrawModal.isOpen}
            onClose={() => setWithdrawModal({ isOpen: false, vault: null, position: null })}
            onSuccess={handleSuccess}
          />
        )}

        {claimModal.vault && claimModal.position && publicKey && (
          <ClaimModal
            vaultId={claimModal.vault.id}
            vaultName={claimModal.vault.name}
            position={claimModal.position}
            userAddress={publicKey.toString()}
            isOpen={claimModal.isOpen}
            onClose={() => setClaimModal({ isOpen: false, vault: null, position: null })}
            onSuccess={handleSuccess}
          />
        )}
      </PageWrapper>
    </PasswordGate>
  );
}
