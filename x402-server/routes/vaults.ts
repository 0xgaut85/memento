/**
 * Vault API Routes
 * 
 * Handles all vault operations: list, deposit, withdraw, claim, user positions
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  verifyDepositTransaction,
  sendVaultWithdrawal,
  sendVaultClaim,
  calculatePendingRewards,
  getCurrentApy,
  getVaultUsdcBalance,
  VAULT_FEE_PERCENT,
} from '../lib/vault-signer';

const router = Router();
const prisma = new PrismaClient();

// ============ GET /vaults - List all vaults with stats ============
router.get('/', async (_req, res) => {
  try {
    const vaults = await prisma.vault.findMany({
      orderBy: { id: 'asc' },
      include: {
        deposits: true,
        transactions: {
          where: { type: 'claim', status: 'completed' },
        },
      },
    });

    const vaultData = await Promise.all(
      vaults.map(async (vault) => {
        // Calculate TVL (sum of all deposits)
        const tvl = vault.deposits.reduce((sum, d) => sum + d.amount, 0);
        
        // Count depositors
        const depositors = vault.deposits.length;
        
        // Total rewards paid
        const totalRewardsPaid = vault.transactions.reduce((sum, t) => sum + t.amount, 0);
        
        // Current APY (animated)
        const currentApy = getCurrentApy(vault.apyMin, vault.apyMax);
        
        // Get actual vault balance
        const vaultBalance = await getVaultUsdcBalance(vault.id);

        return {
          id: vault.id,
          name: vault.name,
          description: vault.description,
          apyMin: vault.apyMin,
          apyMax: vault.apyMax,
          currentApy: Math.round(currentApy * 100) / 100,
          tvl,
          maxTvl: vault.maxTvl,
          maxPerUser: vault.maxPerUser,
          depositors,
          totalRewardsPaid,
          treasuryAddress: vault.treasuryAddress,
          vaultBalance,
          capacityPercent: Math.round((tvl / vault.maxTvl) * 100),
        };
      })
    );

    res.json({ vaults: vaultData });
  } catch (error) {
    console.error('[Vaults] List error:', error);
    res.status(500).json({ error: 'Failed to fetch vaults' });
  }
});

// ============ GET /vaults/:id - Single vault details ============
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vault = await prisma.vault.findUnique({
      where: { id },
      include: {
        deposits: true,
        transactions: {
          where: { status: 'completed' },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }

    const tvl = vault.deposits.reduce((sum, d) => sum + d.amount, 0);
    const depositors = vault.deposits.length;
    const totalRewardsPaid = vault.transactions
      .filter((t) => t.type === 'claim')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentApy = getCurrentApy(vault.apyMin, vault.apyMax);
    const vaultBalance = await getVaultUsdcBalance(vault.id);

    res.json({
      id: vault.id,
      name: vault.name,
      description: vault.description,
      apyMin: vault.apyMin,
      apyMax: vault.apyMax,
      currentApy: Math.round(currentApy * 100) / 100,
      tvl,
      maxTvl: vault.maxTvl,
      maxPerUser: vault.maxPerUser,
      depositors,
      totalRewardsPaid,
      treasuryAddress: vault.treasuryAddress,
      vaultBalance,
      capacityPercent: Math.round((tvl / vault.maxTvl) * 100),
      recentTransactions: vault.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        fee: t.fee,
        txSignature: t.txSignature,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Vaults] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch vault' });
  }
});

// ============ POST /vaults/:id/deposit - Verify and record deposit ============
router.post('/:id/deposit', async (req, res) => {
  try {
    const { id } = req.params;
    const { txSignature, userAddress, expectedAmount } = req.body;

    if (!txSignature || !userAddress) {
      return res.status(400).json({ error: 'Missing txSignature or userAddress' });
    }

    // Get vault
    const vault = await prisma.vault.findUnique({
      where: { id },
      include: { deposits: true },
    });

    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }

    // Check if tx already processed
    const existingTx = await prisma.vaultTransaction.findFirst({
      where: { txSignature },
    });

    if (existingTx) {
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    // Calculate current TVL
    const currentTvl = vault.deposits.reduce((sum, d) => sum + d.amount, 0);

    // Verify the transaction on-chain
    const verification = await verifyDepositTransaction(
      txSignature,
      vault.treasuryAddress,
      expectedAmount ? expectedAmount * 0.9 : 0.01 // Allow 10% slippage or min 0.01 USDC
    );

    if (!verification.valid) {
      return res.status(400).json({ error: verification.error || 'Invalid transaction' });
    }

    const grossAmount = verification.amount;
    const fee = grossAmount * (VAULT_FEE_PERCENT / 100);
    const netAmount = grossAmount - fee;

    // Check vault capacity
    if (currentTvl + netAmount > vault.maxTvl) {
      return res.status(400).json({
        error: 'Vault capacity exceeded',
        available: vault.maxTvl - currentTvl,
      });
    }

    // Check user limit
    const existingDeposit = await prisma.vaultDeposit.findUnique({
      where: { vaultId_userAddress: { vaultId: id, userAddress } },
    });

    const currentUserDeposit = existingDeposit?.amount || 0;
    if (currentUserDeposit + netAmount > vault.maxPerUser) {
      return res.status(400).json({
        error: 'User deposit limit exceeded',
        available: vault.maxPerUser - currentUserDeposit,
      });
    }

    // Record the deposit
    const now = new Date();

    if (existingDeposit) {
      // Update existing deposit
      await prisma.vaultDeposit.update({
        where: { id: existingDeposit.id },
        data: {
          amount: existingDeposit.amount + netAmount,
          // Don't reset lastClaimAt - user keeps their accrued rewards
        },
      });
    } else {
      // Create new deposit
      await prisma.vaultDeposit.create({
        data: {
          vaultId: id,
          userAddress,
          amount: netAmount,
          depositedAt: now,
          lastClaimAt: now,
        },
      });
    }

    // Record the transaction
    await prisma.vaultTransaction.create({
      data: {
        vaultId: id,
        userAddress,
        type: 'deposit',
        amount: netAmount,
        fee,
        txSignature,
        status: 'completed',
      },
    });

    console.log(`[Vaults] Deposit recorded: ${netAmount} USDC (fee: ${fee}) from ${userAddress} to vault ${id}`);

    res.json({
      success: true,
      grossAmount,
      fee,
      netAmount,
      txSignature,
      message: `Deposited ${netAmount.toFixed(2)} USDC (${VAULT_FEE_PERCENT}% fee: ${fee.toFixed(2)} USDC)`,
    });
  } catch (error) {
    console.error('[Vaults] Deposit error:', error);
    res.status(500).json({ error: 'Failed to process deposit' });
  }
});

// ============ POST /vaults/:id/withdraw - Process withdrawal ============
router.post('/:id/withdraw', async (req, res) => {
  try {
    const { id } = req.params;
    const { userAddress, amount } = req.body;

    if (!userAddress || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Missing userAddress or invalid amount' });
    }

    // Get user's deposit
    const deposit = await prisma.vaultDeposit.findUnique({
      where: { vaultId_userAddress: { vaultId: id, userAddress } },
    });

    if (!deposit) {
      return res.status(400).json({ error: 'No deposit found' });
    }

    if (amount > deposit.amount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        available: deposit.amount,
      });
    }

    // Send withdrawal from vault
    const result = await sendVaultWithdrawal(id, userAddress, amount);

    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Withdrawal failed' });
    }

    // Update deposit balance
    const newAmount = deposit.amount - amount;

    if (newAmount <= 0) {
      // Delete deposit if fully withdrawn
      await prisma.vaultDeposit.delete({
        where: { id: deposit.id },
      });
    } else {
      await prisma.vaultDeposit.update({
        where: { id: deposit.id },
        data: { amount: newAmount },
      });
    }

    // Record the transaction
    await prisma.vaultTransaction.create({
      data: {
        vaultId: id,
        userAddress,
        type: 'withdraw',
        amount: result.netAmount!,
        fee: result.fee,
        txSignature: result.txSignature!,
        status: 'completed',
      },
    });

    // Record fee transaction
    if (result.fee && result.fee > 0) {
      await prisma.vaultTransaction.create({
        data: {
          vaultId: id,
          userAddress,
          type: 'fee',
          amount: result.fee,
          txSignature: result.txSignature!,
          status: 'completed',
        },
      });
    }

    console.log(`[Vaults] Withdrawal processed: ${result.netAmount} USDC (fee: ${result.fee}) to ${userAddress} from vault ${id}`);

    res.json({
      success: true,
      grossAmount: amount,
      netAmount: result.netAmount,
      fee: result.fee,
      txSignature: result.txSignature,
      message: `Withdrew ${result.netAmount?.toFixed(2)} USDC (${VAULT_FEE_PERCENT}% fee: ${result.fee?.toFixed(2)} USDC)`,
    });
  } catch (error) {
    console.error('[Vaults] Withdraw error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// ============ POST /vaults/:id/claim - Claim rewards ============
router.post('/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({ error: 'Missing userAddress' });
    }

    // Get vault and user's deposit
    const vault = await prisma.vault.findUnique({ where: { id } });
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }

    const deposit = await prisma.vaultDeposit.findUnique({
      where: { vaultId_userAddress: { vaultId: id, userAddress } },
    });

    if (!deposit) {
      return res.status(400).json({ error: 'No deposit found' });
    }

    // Calculate pending rewards using current APY
    const currentApy = getCurrentApy(vault.apyMin, vault.apyMax);
    const pendingRewards = calculatePendingRewards(
      deposit.amount,
      currentApy,
      deposit.lastClaimAt
    );

    if (pendingRewards < 0.01) {
      return res.status(400).json({
        error: 'Minimum claim is 0.01 USDC',
        pendingRewards,
      });
    }

    // Send rewards from vault (no fee on claims)
    const result = await sendVaultClaim(id, userAddress, pendingRewards);

    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Claim failed' });
    }

    // Update deposit
    await prisma.vaultDeposit.update({
      where: { id: deposit.id },
      data: {
        lastClaimAt: new Date(),
        totalClaimed: deposit.totalClaimed + pendingRewards,
      },
    });

    // Record the transaction
    await prisma.vaultTransaction.create({
      data: {
        vaultId: id,
        userAddress,
        type: 'claim',
        amount: pendingRewards,
        txSignature: result.txSignature!,
        status: 'completed',
      },
    });

    console.log(`[Vaults] Claim processed: ${pendingRewards} USDC to ${userAddress} from vault ${id}`);

    res.json({
      success: true,
      amount: pendingRewards,
      txSignature: result.txSignature,
      message: `Claimed ${pendingRewards.toFixed(4)} USDC in rewards`,
    });
  } catch (error) {
    console.error('[Vaults] Claim error:', error);
    res.status(500).json({ error: 'Failed to process claim' });
  }
});

// ============ GET /vaults/user/:address - User positions across all vaults ============
router.get('/user/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const deposits = await prisma.vaultDeposit.findMany({
      where: { userAddress: address },
      include: { vault: true },
    });

    const transactions = await prisma.vaultTransaction.findMany({
      where: { userAddress: address, status: 'completed' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { vault: true },
    });

    const positions = deposits.map((deposit) => {
      const currentApy = getCurrentApy(deposit.vault.apyMin, deposit.vault.apyMax);
      const pendingRewards = calculatePendingRewards(
        deposit.amount,
        currentApy,
        deposit.lastClaimAt
      );

      return {
        vaultId: deposit.vaultId,
        vaultName: deposit.vault.name,
        depositAmount: deposit.amount,
        depositedAt: deposit.depositedAt.toISOString(),
        lastClaimAt: deposit.lastClaimAt.toISOString(),
        totalClaimed: deposit.totalClaimed,
        pendingRewards,
        currentApy: Math.round(currentApy * 100) / 100,
      };
    });

    // Calculate totals
    const totalDeposited = positions.reduce((sum, p) => sum + p.depositAmount, 0);
    const totalPendingRewards = positions.reduce((sum, p) => sum + p.pendingRewards, 0);
    const totalClaimed = positions.reduce((sum, p) => sum + p.totalClaimed, 0);

    res.json({
      address,
      positions,
      totals: {
        deposited: totalDeposited,
        pendingRewards: totalPendingRewards,
        totalClaimed,
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        vaultId: t.vaultId,
        vaultName: t.vault.name,
        type: t.type,
        amount: t.amount,
        fee: t.fee,
        txSignature: t.txSignature,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Vaults] User positions error:', error);
    res.status(500).json({ error: 'Failed to fetch user positions' });
  }
});

export default router;

