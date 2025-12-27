"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";
import Image from "next/image";
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
            className="max-w-2xl"
          >
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
              approach with different risk and reward profiles.
            </p>
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
                    <div className="flex items-center gap-1.5">
                      <Image
                        src="/cryptologo/USDC.png"
                        alt="USDC"
                        width={18}
                        height={18}
                        className="w-4.5 h-4.5"
                      />
                      <p className="text-2xl font-black font-mono">
                        {userData.totals.deposited.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black flex items-center justify-center">
                    <Image
                      src="/cryptologo/USDC.png"
                      alt="USDC"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-black/40 tracking-wider font-medium">
                      PENDING REWARDS
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-2xl font-black font-mono">
                        +{userData.totals.pendingRewards.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black/10 flex items-center justify-center">
                    <Image
                      src="/cryptologo/USDC.png"
                      alt="USDC"
                      width={20}
                      height={20}
                      className="w-5 h-5 opacity-60"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-black/40 tracking-wider font-medium">
                      TOTAL CLAIMED
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-2xl font-black font-mono">
                        {userData.totals.totalClaimed.toFixed(2)}
                      </p>
                    </div>
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

        {/* Info Footer - Natural language */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 p-8 bg-black/[0.02] border border-black/5"
        >
          <p className="text-sm text-black/40 leading-relaxed">
            A small fee of 1.5% is applied when you deposit or withdraw from any vault. 
            Claiming your rewards is always free. Each vault has a capacity limit of $100,000 
            and you can deposit up to $5,000 per vault. Rewards are calculated based on the 
            current APY, which may fluctuate over time. Past performance does not guarantee 
            future results.
          </p>
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
