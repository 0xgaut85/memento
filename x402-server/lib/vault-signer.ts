/**
 * Vault Signer Utility
 * 
 * Manages vault treasury wallets and signs transactions for withdrawals/claims.
 * Private keys are loaded from Railway environment variables.
 */

import { Keypair, Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import bs58 from 'bs58';

// USDC Mint on mainnet
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Fee percentage (1.5%)
export const VAULT_FEE_PERCENT = 1.5;

// Solana RPC
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=a9590b4c-8a59-4b03-93b2-799e49bb5c0f';

// Fee wallet address (where 1.5% fees go)
const FEE_WALLET_ADDRESS = process.env.FEE_WALLET_ADDRESS || '';

// Rewards wallet private key (separate wallet for paying out rewards)
// If not set, rewards will be paid from vault treasury
const REWARDS_WALLET_PRIVATE_KEY = process.env.REWARDS_WALLET_PRIVATE_KEY || '';

// Vault private key env var names
const VAULT_KEY_ENV_VARS: Record<string, string> = {
  '01': 'VAULT_01_PRIVATE_KEY',
  '02': 'VAULT_02_PRIVATE_KEY',
  '03': 'VAULT_03_PRIVATE_KEY',
  '04': 'VAULT_04_PRIVATE_KEY',
};

/**
 * Get the Keypair for a vault from environment variable
 */
export function getVaultKeypair(vaultId: string): Keypair | null {
  const envVar = VAULT_KEY_ENV_VARS[vaultId];
  if (!envVar) {
    console.error(`[VaultSigner] Unknown vault ID: ${vaultId}`);
    return null;
  }

  const privateKey = process.env[envVar];
  if (!privateKey) {
    console.error(`[VaultSigner] Missing env var: ${envVar}`);
    return null;
  }

  try {
    // Try base58 decode first (standard Solana format)
    const decoded = bs58.decode(privateKey);
    return Keypair.fromSecretKey(decoded);
  } catch {
    try {
      // Try base64 decode as fallback
      const decoded = Buffer.from(privateKey, 'base64');
      return Keypair.fromSecretKey(decoded);
    } catch (e) {
      console.error(`[VaultSigner] Failed to decode private key for vault ${vaultId}:`, e);
      return null;
    }
  }
}

/**
 * Get vault treasury address from keypair
 */
export function getVaultAddress(vaultId: string): string | null {
  const keypair = getVaultKeypair(vaultId);
  if (!keypair) return null;
  return keypair.publicKey.toString();
}

/**
 * Get the Rewards Wallet Keypair (for paying out rewards)
 * Falls back to null if not configured
 */
export function getRewardsWalletKeypair(): Keypair | null {
  if (!REWARDS_WALLET_PRIVATE_KEY) {
    return null;
  }

  try {
    // Try base58 decode first (standard Solana format)
    const decoded = bs58.decode(REWARDS_WALLET_PRIVATE_KEY);
    return Keypair.fromSecretKey(decoded);
  } catch {
    try {
      // Try base64 decode as fallback
      const decoded = Buffer.from(REWARDS_WALLET_PRIVATE_KEY, 'base64');
      return Keypair.fromSecretKey(decoded);
    } catch (e) {
      console.error('[VaultSigner] Failed to decode rewards wallet private key:', e);
      return null;
    }
  }
}

/**
 * Get Solana connection
 */
export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

/**
 * Get vault USDC balance
 */
export async function getVaultUsdcBalance(vaultId: string): Promise<number> {
  const keypair = getVaultKeypair(vaultId);
  if (!keypair) return 0;

  const connection = getConnection();
  
  try {
    const ata = await getAssociatedTokenAddress(USDC_MINT, keypair.publicKey);
    const account = await getAccount(connection, ata);
    return Number(account.amount) / 1_000_000; // Convert from micro-units to USDC
  } catch {
    return 0;
  }
}

/**
 * Verify a deposit transaction
 * Returns the actual USDC amount received (before our fee deduction)
 */
export async function verifyDepositTransaction(
  txSignature: string,
  expectedVaultAddress: string,
  minAmount: number
): Promise<{ valid: boolean; amount: number; sender: string; error?: string }> {
  const connection = getConnection();

  try {
    // Fetch transaction
    const tx = await connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { valid: false, amount: 0, sender: '', error: 'Transaction not found' };
    }

    if (tx.meta?.err) {
      return { valid: false, amount: 0, sender: '', error: 'Transaction failed' };
    }

    // Parse token transfers from the transaction
    // Look for USDC transfer to the vault address
    const preBalances = tx.meta?.preTokenBalances || [];
    const postBalances = tx.meta?.postTokenBalances || [];

    // Find the vault's USDC account
    let vaultReceived = 0;
    let sender = '';

    for (const post of postBalances) {
      if (post.mint === USDC_MINT.toString() && post.owner === expectedVaultAddress) {
        const pre = preBalances.find(
          (p) => p.accountIndex === post.accountIndex
        );
        const preAmount = pre ? Number(pre.uiTokenAmount.amount) : 0;
        const postAmount = Number(post.uiTokenAmount.amount);
        vaultReceived = (postAmount - preAmount) / 1_000_000;
      }
    }

    // Find sender (who had USDC decrease)
    for (const pre of preBalances) {
      if (pre.mint === USDC_MINT.toString()) {
        const post = postBalances.find((p) => p.accountIndex === pre.accountIndex);
        const preAmount = Number(pre.uiTokenAmount.amount);
        const postAmount = post ? Number(post.uiTokenAmount.amount) : 0;
        if (preAmount > postAmount && pre.owner) {
          sender = pre.owner;
          break;
        }
      }
    }

    if (vaultReceived < minAmount) {
      return {
        valid: false,
        amount: vaultReceived,
        sender,
        error: `Insufficient amount: received ${vaultReceived}, expected at least ${minAmount}`,
      };
    }

    return { valid: true, amount: vaultReceived, sender };
  } catch (e) {
    console.error('[VaultSigner] verifyDepositTransaction error:', e);
    return { valid: false, amount: 0, sender: '', error: String(e) };
  }
}

/**
 * Send USDC from vault to user (for withdrawals)
 * Deducts 1.5% fee and sends fee to fee wallet
 */
export async function sendVaultWithdrawal(
  vaultId: string,
  recipientAddress: string,
  grossAmount: number // Amount before fee
): Promise<{ success: boolean; txSignature?: string; netAmount?: number; fee?: number; error?: string }> {
  const keypair = getVaultKeypair(vaultId);
  if (!keypair) {
    return { success: false, error: 'Vault keypair not found' };
  }

  if (!FEE_WALLET_ADDRESS) {
    return { success: false, error: 'Fee wallet address not configured' };
  }

  const connection = getConnection();
  const fee = grossAmount * (VAULT_FEE_PERCENT / 100);
  const netAmount = grossAmount - fee;

  // Convert to micro-units (6 decimals)
  const netAmountMicro = Math.floor(netAmount * 1_000_000);
  const feeMicro = Math.floor(fee * 1_000_000);

  try {
    const vaultAta = await getAssociatedTokenAddress(USDC_MINT, keypair.publicKey);
    const recipientPubkey = new PublicKey(recipientAddress);
    const recipientAta = await getAssociatedTokenAddress(USDC_MINT, recipientPubkey);
    const feeWalletPubkey = new PublicKey(FEE_WALLET_ADDRESS);
    const feeAta = await getAssociatedTokenAddress(USDC_MINT, feeWalletPubkey);

    const transaction = new Transaction();

    // Check if recipient ATA exists, create if not
    try {
      await getAccount(connection, recipientAta);
    } catch {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          keypair.publicKey,
          recipientAta,
          recipientPubkey,
          USDC_MINT
        )
      );
    }

    // Check if fee wallet ATA exists, create if not
    try {
      await getAccount(connection, feeAta);
    } catch {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          keypair.publicKey,
          feeAta,
          feeWalletPubkey,
          USDC_MINT
        )
      );
    }

    // Transfer net amount to recipient
    transaction.add(
      createTransferInstruction(
        vaultAta,
        recipientAta,
        keypair.publicKey,
        netAmountMicro
      )
    );

    // Transfer fee to fee wallet
    if (feeMicro > 0) {
      transaction.add(
        createTransferInstruction(
          vaultAta,
          feeAta,
          keypair.publicKey,
          feeMicro
        )
      );
    }

    // Send transaction
    const txSignature = await sendAndConfirmTransaction(connection, transaction, [keypair], {
      commitment: 'confirmed',
    });

    console.log(`[VaultSigner] Withdrawal sent: ${txSignature}`);
    console.log(`[VaultSigner] Net: ${netAmount} USDC, Fee: ${fee} USDC`);

    return { success: true, txSignature, netAmount, fee };
  } catch (e) {
    console.error('[VaultSigner] sendVaultWithdrawal error:', e);
    return { success: false, error: String(e) };
  }
}

/**
 * Send USDC from rewards wallet to user (for reward claims - no fee)
 * Uses dedicated rewards wallet if configured, otherwise falls back to vault treasury
 */
export async function sendVaultClaim(
  vaultId: string,
  recipientAddress: string,
  amount: number
): Promise<{ success: boolean; txSignature?: string; error?: string }> {
  // Try to use rewards wallet first, fall back to vault treasury
  const rewardsKeypair = getRewardsWalletKeypair();
  const vaultKeypair = getVaultKeypair(vaultId);
  
  const keypair = rewardsKeypair || vaultKeypair;
  const sourceType = rewardsKeypair ? 'rewards wallet' : 'vault treasury';
  
  if (!keypair) {
    return { success: false, error: 'No keypair found for rewards (neither rewards wallet nor vault treasury)' };
  }

  const connection = getConnection();
  const amountMicro = Math.floor(amount * 1_000_000);

  try {
    const sourceAta = await getAssociatedTokenAddress(USDC_MINT, keypair.publicKey);
    const recipientPubkey = new PublicKey(recipientAddress);
    const recipientAta = await getAssociatedTokenAddress(USDC_MINT, recipientPubkey);

    const transaction = new Transaction();

    // Check if recipient ATA exists, create if not
    try {
      await getAccount(connection, recipientAta);
    } catch {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          keypair.publicKey,
          recipientAta,
          recipientPubkey,
          USDC_MINT
        )
      );
    }

    // Transfer reward amount to recipient
    transaction.add(
      createTransferInstruction(
        sourceAta,
        recipientAta,
        keypair.publicKey,
        amountMicro
      )
    );

    // Send transaction
    const txSignature = await sendAndConfirmTransaction(connection, transaction, [keypair], {
      commitment: 'confirmed',
    });

    console.log(`[VaultSigner] Claim sent from ${sourceType}: ${txSignature}, Amount: ${amount} USDC`);

    return { success: true, txSignature };
  } catch (e) {
    console.error('[VaultSigner] sendVaultClaim error:', e);
    return { success: false, error: String(e) };
  }
}

/**
 * Calculate pending rewards for a deposit
 * Based on deposit amount, APY, and time since last claim
 */
export function calculatePendingRewards(
  depositAmount: number,
  apyPercent: number,
  lastClaimAt: Date
): number {
  const now = new Date();
  const msElapsed = now.getTime() - lastClaimAt.getTime();
  const yearsElapsed = msElapsed / (365.25 * 24 * 60 * 60 * 1000);
  
  // Simple interest calculation: amount * (apy/100) * time
  const rewards = depositAmount * (apyPercent / 100) * yearsElapsed;
  
  return Math.max(0, rewards);
}

/**
 * Get current APY for a vault (oscillates between min and max)
 * Uses sine wave for natural-looking movement
 */
export function getCurrentApy(apyMin: number, apyMax: number): number {
  // Use current time to create slow oscillation (period ~6 hours)
  const period = 6 * 60 * 60 * 1000; // 6 hours in ms
  const phase = (Date.now() % period) / period;
  const sine = Math.sin(phase * 2 * Math.PI);
  
  // Map sine [-1, 1] to [0, 1], then bias toward upper half
  const normalized = (sine + 1) / 2;
  const biased = 0.5 + normalized * 0.5; // Range [0.5, 1] - biased toward high
  
  return apyMin + biased * (apyMax - apyMin);
}

