"use client";

import { useState, useEffect, useCallback } from "react";

const VAULT_API_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || "https://x402.memento.money";

export interface Vault {
  id: string;
  name: string;
  description: string;
  apyMin: number;
  apyMax: number;
  currentApy: number;
  tvl: number;
  maxTvl: number;
  maxPerUser: number;
  depositors: number;
  totalRewardsPaid: number;
  treasuryAddress: string;
  vaultBalance: number;
  capacityPercent: number;
}

export interface UserPosition {
  vaultId: string;
  vaultName: string;
  depositAmount: number;
  depositedAt: string;
  lastClaimAt: string;
  totalClaimed: number;
  pendingRewards: number;
  currentApy: number;
}

export interface UserTransaction {
  id: string;
  vaultId: string;
  vaultName: string;
  type: "deposit" | "withdraw" | "claim" | "fee";
  amount: number;
  fee?: number;
  txSignature: string;
  createdAt: string;
}

export interface UserData {
  address: string;
  positions: UserPosition[];
  totals: {
    deposited: number;
    pendingRewards: number;
    totalClaimed: number;
  };
  transactions: UserTransaction[];
}

/**
 * Hook to fetch all vaults
 */
export function useVaults() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVaults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${VAULT_API_URL}/vaults`);
      if (!res.ok) throw new Error("Failed to fetch vaults");
      const data = await res.json();
      setVaults(data.vaults || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVaults();
    // No auto-refresh - APY updates naturally when user refreshes
  }, [fetchVaults]);

  return { vaults, loading, error, refetch: fetchVaults };
}

/**
 * Hook to fetch a single vault
 */
export function useVault(vaultId: string) {
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVault = useCallback(async () => {
    if (!vaultId) return;
    try {
      setLoading(true);
      const res = await fetch(`${VAULT_API_URL}/vaults/${vaultId}`);
      if (!res.ok) throw new Error("Failed to fetch vault");
      const data = await res.json();
      setVault(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [vaultId]);

  useEffect(() => {
    fetchVault();
    // No auto-refresh - updates naturally when user refreshes
  }, [fetchVault]);

  return { vault, loading, error, refetch: fetchVault };
}

/**
 * Hook to fetch user positions
 */
export function useUserPositions(address: string | null) {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!address) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${VAULT_API_URL}/vaults/user/${address}`);
      if (!res.ok) throw new Error("Failed to fetch positions");
      const result = await res.json();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchPositions();
    // No auto-refresh - updates naturally when user refreshes
  }, [fetchPositions]);

  return { data, loading, error, refetch: fetchPositions };
}

/**
 * Deposit USDC to a vault
 */
export async function depositToVault(
  vaultId: string,
  txSignature: string,
  userAddress: string,
  expectedAmount: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${VAULT_API_URL}/vaults/${vaultId}/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txSignature, userAddress, expectedAmount }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Deposit failed" };
    }

    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/**
 * Withdraw USDC from a vault
 */
export async function withdrawFromVault(
  vaultId: string,
  userAddress: string,
  amount: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${VAULT_API_URL}/vaults/${vaultId}/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress, amount }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Withdrawal failed" };
    }

    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/**
 * Claim rewards from a vault
 */
export async function claimFromVault(
  vaultId: string,
  userAddress: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${VAULT_API_URL}/vaults/${vaultId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAddress }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Claim failed" };
    }

    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

