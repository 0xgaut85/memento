-- CreateTable
CREATE TABLE "Vault" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "apyMin" DOUBLE PRECISION NOT NULL,
    "apyMax" DOUBLE PRECISION NOT NULL,
    "maxTvl" DOUBLE PRECISION NOT NULL DEFAULT 100000,
    "maxPerUser" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "treasuryAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultDeposit" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "userAddress" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "depositedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastClaimAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalClaimed" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "VaultDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultTransaction" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "userAddress" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION,
    "txSignature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VaultTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaultDeposit_vaultId_userAddress_key" ON "VaultDeposit"("vaultId", "userAddress");

-- CreateIndex
CREATE INDEX "VaultDeposit_userAddress_idx" ON "VaultDeposit"("userAddress");

-- CreateIndex
CREATE INDEX "VaultTransaction_vaultId_idx" ON "VaultTransaction"("vaultId");

-- CreateIndex
CREATE INDEX "VaultTransaction_userAddress_idx" ON "VaultTransaction"("userAddress");

-- CreateIndex
CREATE INDEX "VaultTransaction_type_idx" ON "VaultTransaction"("type");

-- CreateIndex
CREATE INDEX "VaultTransaction_createdAt_idx" ON "VaultTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "VaultDeposit" ADD CONSTRAINT "VaultDeposit_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultTransaction" ADD CONSTRAINT "VaultTransaction_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

