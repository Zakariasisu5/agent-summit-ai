#!/usr/bin/env node

/**
 * Generate private keys for 0G Storage and Compute
 * Run: node scripts/generate-keys.js
 */

import { ethers } from 'ethers';

console.log('🔐 Generating Private Keys for CredLayer\n');
console.log('═══════════════════════════════════════════════\n');

// Generate Storage Key
const storageWallet = ethers.Wallet.createRandom();
console.log('📦 0G STORAGE KEY:');
console.log('─────────────────────────────────────────────');
console.log('Private Key:', storageWallet.privateKey);
console.log('Address:    ', storageWallet.address);
console.log('');

// Generate Compute Key
const computeWallet = ethers.Wallet.createRandom();
console.log('🖥️  0G COMPUTE KEY:');
console.log('─────────────────────────────────────────────');
console.log('Private Key:', computeWallet.privateKey);
console.log('Address:    ', computeWallet.address);
console.log('');

console.log('═══════════════════════════════════════════════');
console.log('📝 Add these to your .env file:');
console.log('═══════════════════════════════════════════════');
console.log(`ZG_STORAGE_PRIVATE_KEY=${storageWallet.privateKey}`);
console.log(`ZG_COMPUTE_PRIVATE_KEY=${computeWallet.privateKey}`);
console.log('═══════════════════════════════════════════════\n');

console.log('⚠️  NEXT STEPS:');
console.log('─────────────────────────────────────────────');
console.log('1. Fund both addresses with 0G testnet tokens:');
console.log('   Visit: https://faucet.0g.ai');
console.log('');
console.log('   Storage Address:', storageWallet.address);
console.log('   Compute Address:', computeWallet.address);
console.log('');
console.log('2. For Compute key, pre-fund with broker:');
console.log('   npm install -g 0g-compute-cli');
console.log(`   0g-compute-cli add-account --private-key ${computeWallet.privateKey} --amount 0.01`);
console.log('');
console.log('3. Update your .env file with the private keys');
console.log('');
console.log('⚠️  SECURITY WARNING:');
console.log('   - NEVER commit private keys to git');
console.log('   - Keep .env in .gitignore');
console.log('   - Use different keys for production');
console.log('═══════════════════════════════════════════════\n');
