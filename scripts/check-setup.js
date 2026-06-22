#!/usr/bin/env node

/**
 * Check if the development environment is properly configured
 * Run: node scripts/check-setup.js
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

console.log('🔍 CredLayer Setup Checker\n');
console.log('═══════════════════════════════════════════════\n');

const errors = [];
const warnings = [];
const success = [];

// Check .env file exists
console.log('📁 Checking .env file...');
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  errors.push('.env file not found. Copy .env.example to .env');
} else {
  success.push('.env file exists');
  
  // Read and parse .env
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });

  // Check required variables
  console.log('\n🔑 Checking environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_CHAIN_ID',
    'NEXT_PUBLIC_0G_RPC_URL',
    'NEXT_PUBLIC_CONTRACT_IDENTITY',
    'NEXT_PUBLIC_CONTRACT_REPUTATION',
    'NEXT_PUBLIC_CONTRACT_CREDENTIAL',
    'ZG_STORAGE_PRIVATE_KEY',
    'ZG_COMPUTE_PRIVATE_KEY',
  ];

  const optionalVars = [
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    'AI_API_URL',
  ];

  requiredVars.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === '') {
      errors.push(`${varName} is not set`);
    } else {
      success.push(`${varName} is configured`);
    }
  });

  optionalVars.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === '' || envVars[varName] === 'your_project_id_here') {
      warnings.push(`${varName} is not set (optional but recommended)`);
    } else {
      success.push(`${varName} is configured`);
    }
  });

  // Check private keys format
  console.log('\n🔐 Validating private keys...');
  
  if (envVars.ZG_STORAGE_PRIVATE_KEY) {
    if (!envVars.ZG_STORAGE_PRIVATE_KEY.startsWith('0x') || envVars.ZG_STORAGE_PRIVATE_KEY.length !== 66) {
      errors.push('ZG_STORAGE_PRIVATE_KEY format invalid (should be 0x + 64 hex chars)');
    } else {
      try {
        const wallet = new ethers.Wallet(envVars.ZG_STORAGE_PRIVATE_KEY);
        success.push(`Storage key valid: ${wallet.address}`);
      } catch (e) {
        errors.push(`ZG_STORAGE_PRIVATE_KEY is invalid: ${e.message}`);
      }
    }
  }

  if (envVars.ZG_COMPUTE_PRIVATE_KEY) {
    if (!envVars.ZG_COMPUTE_PRIVATE_KEY.startsWith('0x') || envVars.ZG_COMPUTE_PRIVATE_KEY.length !== 66) {
      errors.push('ZG_COMPUTE_PRIVATE_KEY format invalid (should be 0x + 64 hex chars)');
    } else {
      try {
        const wallet = new ethers.Wallet(envVars.ZG_COMPUTE_PRIVATE_KEY);
        success.push(`Compute key valid: ${wallet.address}`);
      } catch (e) {
        errors.push(`ZG_COMPUTE_PRIVATE_KEY is invalid: ${e.message}`);
      }
    }
  }

  // Check RPC connectivity
  console.log('\n🌐 Testing RPC connectivity...');
  if (envVars.NEXT_PUBLIC_0G_RPC_URL) {
    try {
      const provider = new ethers.JsonRpcProvider(envVars.NEXT_PUBLIC_0G_RPC_URL);
      const blockNumber = await provider.getBlockNumber().catch(e => {
        throw new Error(`Failed to connect: ${e.message}`);
      });
      success.push(`RPC connected successfully (block #${blockNumber})`);
      
      // Check chain ID
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const expectedChainId = Number(envVars.NEXT_PUBLIC_CHAIN_ID || 16602);
      
      if (chainId === expectedChainId) {
        success.push(`Chain ID matches: ${chainId}`);
      } else {
        errors.push(`Chain ID mismatch! RPC returns ${chainId} but expected ${expectedChainId}`);
      }
    } catch (e) {
      errors.push(`RPC connection failed: ${e.message}`);
      warnings.push('Check your network connection and firewall settings');
    }
  }

  // Check wallet balances
  console.log('\n💰 Checking wallet balances...');
  if (envVars.ZG_STORAGE_PRIVATE_KEY && envVars.NEXT_PUBLIC_0G_RPC_URL) {
    try {
      const provider = new ethers.JsonRpcProvider(envVars.NEXT_PUBLIC_0G_RPC_URL);
      const storageWallet = new ethers.Wallet(envVars.ZG_STORAGE_PRIVATE_KEY, provider);
      const balance = await provider.getBalance(storageWallet.address).catch(() => ethers.parseEther('0'));
      const balanceEth = ethers.formatEther(balance);
      
      if (parseFloat(balanceEth) > 0) {
        success.push(`Storage wallet funded: ${balanceEth} 0G`);
      } else {
        warnings.push(`Storage wallet has no funds (${storageWallet.address})`);
        warnings.push('Get testnet tokens from https://faucet.0g.ai');
      }
    } catch (e) {
      warnings.push(`Could not check storage wallet balance: ${e.message}`);
    }
  }

  if (envVars.ZG_COMPUTE_PRIVATE_KEY && envVars.NEXT_PUBLIC_0G_RPC_URL) {
    try {
      const provider = new ethers.JsonRpcProvider(envVars.NEXT_PUBLIC_0G_RPC_URL);
      const computeWallet = new ethers.Wallet(envVars.ZG_COMPUTE_PRIVATE_KEY, provider);
      const balance = await provider.getBalance(computeWallet.address).catch(() => ethers.parseEther('0'));
      const balanceEth = ethers.formatEther(balance);
      
      if (parseFloat(balanceEth) > 0) {
        success.push(`Compute wallet funded: ${balanceEth} 0G`);
      } else {
        warnings.push(`Compute wallet has no funds (${computeWallet.address})`);
        warnings.push('Get testnet tokens from https://faucet.0g.ai');
      }
    } catch (e) {
      warnings.push(`Could not check compute wallet balance: ${e.message}`);
    }
  }
}

// Check node_modules
console.log('\n📦 Checking dependencies...');
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  errors.push('node_modules not found. Run: npm install');
} else {
  success.push('Dependencies installed');
}

// Print results
console.log('\n═══════════════════════════════════════════════');
console.log('📊 RESULTS');
console.log('═══════════════════════════════════════════════\n');

if (success.length > 0) {
  console.log('✅ SUCCESS (' + success.length + ')');
  success.forEach(msg => console.log('  ✓', msg));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS (' + warnings.length + ')');
  warnings.forEach(msg => console.log('  ⚠', msg));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS (' + errors.length + ')');
  errors.forEach(msg => console.log('  ✗', msg));
  console.log('');
}

console.log('═══════════════════════════════════════════════\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('🎉 Perfect! Your setup is complete and ready to go!\n');
  console.log('Next steps:');
  console.log('  1. npm run dev');
  console.log('  2. Open http://localhost:3000');
  console.log('');
  process.exit(0);
} else if (errors.length === 0) {
  console.log('✅ Setup is functional but has some warnings.');
  console.log('You can proceed, but consider addressing warnings.\n');
  process.exit(0);
} else {
  console.log('❌ Setup incomplete. Fix the errors above before continuing.\n');
  console.log('Need help? Check TROUBLESHOOTING.md or SETUP-KEYS.md\n');
  process.exit(1);
}
