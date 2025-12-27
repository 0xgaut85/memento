"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet, LayoutDashboard, ArrowUpRight } from "lucide-react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { PasswordGate } from "@/components/vaults/password-gate";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { VaultPositions } from "@/components/dashboard/vault-positions";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { WithdrawModal } from "@/components/vaults/withdraw-modal";
import { ClaimModal } from "@/components/vaults/claim-modal";
import { useVaults, useUserPositions, Vault, UserPosition } from "@/lib/hooks/use-vault";

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { vaults } = useVaults();
  const { data: userData, loading, error, refetch } = useUserPositions(
    publicKey?.toString() || null
  );

  // Modal state
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

  // Get vault by ID
  const getVault = (vaultId: string): Vault | undefined => {
    return vaults.find((v) => v.id === vaultId);
  };

  // Handlers
  const handleWithdraw = (vaultId: string) => {
    const vault = getVault(vaultId);
    const position = userData?.positions.find((p) => p.vaultId === vaultId);
    if (vault && position) {
      setWithdrawModal({ isOpen: true, vault, position });
    }
  };

  const handleClaim = (vaultId: string) => {
    const vault = getVault(vaultId);
    const position = userData?.positions.find((p) => p.vaultId === vaultId);
    if (vault && position) {
      setClaimModal({ isOpen: true, vault, position });
    }
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <PasswordGate storageKey="vault_access">
      <PageWrapper>
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <LayoutDashboard className="w-6 h-6 text-purple-600" />
                <p className="text-sm font-mono text-purple-600">DASHBOARD</p>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Your Portfolio
              </h1>
            </div>

            <a
              href="/vaults"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold hover:bg-black/90 transition-colors"
            >
              Go to Vaults
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Not Connected State */}
        {!connected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-black/5 p-12 text-center"
          >
            <div className="w-16 h-16 bg-black mx-auto mb-6 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-black/50 mb-6 max-w-md mx-auto">
              Connect your Solana wallet to view your vault positions, pending rewards,
              and transaction history.
            </p>
            <button
              onClick={() => setVisible(true)}
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 font-semibold hover:bg-black/90 transition-colors"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {connected && loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {connected && error && (
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

        {/* Dashboard Content */}
        {connected && userData && !loading && !error && (
          <div className="space-y-8">
            {/* No Positions State */}
            {userData.positions.length === 0 && userData.transactions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-black/5 p-12 text-center"
              >
                <h2 className="text-2xl font-bold mb-2">No Positions Yet</h2>
                <p className="text-black/50 mb-6 max-w-md mx-auto">
                  You haven&apos;t deposited to any vaults yet. Start earning yield on your USDC today.
                </p>
                <a
                  href="/vaults"
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 font-semibold hover:bg-black/90 transition-colors"
                >
                  Explore Vaults
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </motion.div>
            )}

            {/* Has Positions */}
            {(userData.positions.length > 0 || userData.transactions.length > 0) && (
              <>
                {/* Portfolio Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PortfolioSummary userData={userData} />
                </motion.div>

                {/* Positions */}
                {userData.positions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <VaultPositions
                      positions={userData.positions}
                      onClaim={handleClaim}
                      onWithdraw={handleWithdraw}
                    />
                  </motion.div>
                )}

                {/* Transaction History */}
                {userData.transactions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <TransactionHistory transactions={userData.transactions} />
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="sm:hidden mt-8"
        >
          <a
            href="/vaults"
            className="flex items-center justify-center gap-2 w-full py-4 bg-black text-white font-semibold"
          >
            Go to Vaults
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Modals */}
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
