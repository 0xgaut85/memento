"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet, TrendingUp, Shield, Clock } from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PasswordGate } from "@/components/vaults/password-gate";
import { VaultCard } from "@/components/vaults/vault-card";
import { DepositModal } from "@/components/vaults/deposit-modal";
import { WithdrawModal } from "@/components/vaults/withdraw-modal";
import { ClaimModal } from "@/components/vaults/claim-modal";
import { useVaults, useUserPositions, Vault, UserPosition } from "@/lib/hooks/use-vault";
import { GlassCard } from "@/components/ui/glass-card";

export default function VaultsPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { vaults, loading, error, refetch } = useVaults();
  const { data: userData, refetch: refetchPositions } = useUserPositions(
    publicKey?.toString() || null
  );

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

  return (
    <PasswordGate storageKey="vault_access">
      <PageWrapper>
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-mono text-purple-600 mb-2">VAULTS</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Put Your USDC to Work
            </h1>
            <p className="text-lg text-black/50 leading-relaxed">
              Deposit USDC into our curated yield vaults. Each vault runs a distinct
              strategy with different risk/reward profiles. Rewards stream in real-time.
            </p>
          </motion.div>

          {/* Stats Row */}
          {userData && userData.totals.deposited > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-black/40">Total Deposited</p>
                    <p className="text-xl font-bold font-mono">
                      ${userData.totals.deposited.toFixed(2)}
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-black/40">Pending Rewards</p>
                    <p className="text-xl font-bold font-mono text-emerald-600">
                      ${userData.totals.pendingRewards.toFixed(4)}
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-black/40">Total Claimed</p>
                    <p className="text-xl font-bold font-mono">
                      ${userData.totals.totalClaimed.toFixed(2)}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Connect Wallet CTA */}
          {!connected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8"
            >
              <button
                onClick={() => setVisible(true)}
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-semibold hover:bg-black/90 transition-colors"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet to Deposit
              </button>
            </motion.div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-black text-white font-semibold hover:bg-black/90"
            >
              Retry
            </button>
          </div>
        )}

        {/* Vault Cards */}
        {!loading && !error && (
          <div className="space-y-6">
            {vaults.map((vault, index) => (
              <motion.div
                key={vault.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <VaultCard
                  vault={vault}
                  userPosition={getUserPosition(vault.id)}
                  onDeposit={() => handleDeposit(vault)}
                  onWithdraw={() => handleWithdraw(vault)}
                  onClaim={() => handleClaim(vault)}
                  isConnected={connected}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gray-50 border border-black/5"
        >
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-black/30 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Important Information</h4>
              <ul className="text-sm text-black/50 space-y-1">
                <li>• 1.5% fee applies to deposits and withdrawals</li>
                <li>• No fees on reward claims</li>
                <li>• Maximum deposit per user: $5,000 per vault</li>
                <li>• Maximum TVL per vault: $100,000</li>
                <li>• Rewards accrue in real-time based on current APY</li>
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
