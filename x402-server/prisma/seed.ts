/**
 * Vault Seed Script
 * 
 * Seeds the 4 Memento vaults into the database.
 * Run with: npx tsx prisma/seed.ts
 * 
 * NOTE: Update the treasuryAddress values with your actual vault wallet addresses
 * before running in production!
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const vaults = [
  {
    id: '01',
    name: 'Dividend Delta-Neutral',
    description: 'Capture high-dividend equity yields while neutralizing price exposure through systematic hedging.',
    apyMin: 10,
    apyMax: 12,
    maxTvl: 100000,
    maxPerUser: 5000,
    // Will be set from env var VAULT_01_ADDRESS or placeholder
    treasuryAddress: process.env.VAULT_01_ADDRESS || 'VAULT_01_ADDRESS_PLACEHOLDER',
  },
  {
    id: '02',
    name: 'Basis & Funding Arbitrage',
    description: 'Extract yield from perpetual funding rates and futures basis spreads.',
    apyMin: 8,
    apyMax: 10,
    maxTvl: 100000,
    maxPerUser: 5000,
    treasuryAddress: process.env.VAULT_02_ADDRESS || 'VAULT_02_ADDRESS_PLACEHOLDER',
  },
  {
    id: '03',
    name: 'REITs / Income',
    description: 'Tokenized real estate exposure delivering steady rental yields and property appreciation.',
    apyMin: 12,
    apyMax: 14,
    maxTvl: 100000,
    maxPerUser: 5000,
    treasuryAddress: process.env.VAULT_03_ADDRESS || 'VAULT_03_ADDRESS_PLACEHOLDER',
  },
  {
    id: '04',
    name: 'RWA Cashflow',
    description: 'Direct ownership in high-margin businesses. Laundromats, car washes, ATM routes, vending machines.',
    apyMin: 15,
    apyMax: 20,
    maxTvl: 100000,
    maxPerUser: 5000,
    treasuryAddress: process.env.VAULT_04_ADDRESS || 'VAULT_04_ADDRESS_PLACEHOLDER',
  },
];

async function main() {
  console.log('🌱 Seeding vaults...\n');

  for (const vault of vaults) {
    const existing = await prisma.vault.findUnique({ where: { id: vault.id } });
    
    if (existing) {
      // Update existing vault
      await prisma.vault.update({
        where: { id: vault.id },
        data: vault,
      });
      console.log(`  ✅ Updated vault ${vault.id}: ${vault.name}`);
    } else {
      // Create new vault
      await prisma.vault.create({ data: vault });
      console.log(`  ✅ Created vault ${vault.id}: ${vault.name}`);
    }
  }

  console.log('\n✨ Vault seeding complete!\n');
  
  // Display current state
  const allVaults = await prisma.vault.findMany({ orderBy: { id: 'asc' } });
  console.log('Current vaults in database:');
  console.log('━'.repeat(80));
  for (const v of allVaults) {
    console.log(`  ${v.id} | ${v.name.padEnd(30)} | APY: ${v.apyMin}-${v.apyMax}% | Treasury: ${v.treasuryAddress.slice(0, 20)}...`);
  }
  console.log('━'.repeat(80));
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

