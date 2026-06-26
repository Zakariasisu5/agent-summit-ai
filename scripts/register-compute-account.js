/**
 * Register compute account with 0G Serving Broker
 * This properly initializes your account using the broker SDK
 */

import { ethers } from 'ethers';

const RPC_URL = 'https://evmrpc-testnet.0g.ai';
const COMPUTE_PRIVATE_KEY = process.env.ZG_COMPUTE_PRIVATE_KEY || '0xb3048e0e69f96ed3028e5c91bae8a760283361e5809ad3e14257dd09f827ebed';
const AMOUNT = '2.0'; // Amount in A0GI to add to account

async function registerAccount() {
  console.log('🔧 Registering compute account with 0G Serving Broker...\n');
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(COMPUTE_PRIVATE_KEY, provider);
  
  console.log('📍 Your compute wallet:', wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Current balance:', ethers.formatEther(balance), 'A0GI\n');
  
  if (balance < ethers.parseEther(AMOUNT)) {
    console.error('❌ Insufficient balance! Need at least', AMOUNT, 'A0GI');
    console.error('   Fund your wallet first:', wallet.address);
    process.exit(1);
  }
  
  // Load the 0G Serving Broker SDK
  console.log('📦 Loading 0G Serving Broker SDK...');
  const broker = await import('@0glabs/0g-serving-broker');
  
  const createBroker = broker.createZGComputeNetworkBroker ?? broker.createBroker;
  if (!createBroker) {
    console.error('❌ Broker factory not found in SDK');
    process.exit(1);
  }
  
  console.log('🔗 Creating broker client...');
  const client = await createBroker(wallet);
  console.log('✅ Broker client created\n');
  
  // Add account with initial funding
  console.log(`💸 Adding account with ${AMOUNT} A0GI...`);
  
  try {
    const tx = await client.addAccount(ethers.parseEther(AMOUNT));
    console.log('⏳ Transaction sent:', tx.hash);
    console.log('   Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    console.log('\n✅ Account registered successfully!');
    console.log('📋 Transaction hash:', receipt.hash);
    console.log('🔗 View on explorer:', `https://chainscan-galileo.0g.ai/tx/${receipt.hash}`);
    console.log('\n🎉 You can now use AI Analysis in production mode!');
  } catch (error) {
    if (error.message?.includes('already exists') || error.message?.includes('Account already')) {
      console.log('\n✅ Account already registered!');
      console.log('🎉 You can use AI Analysis in production mode!');
    } else {
      throw error;
    }
  }
}

registerAccount().catch((error) => {
  console.error('\n❌ Registration failed:', error.message);
  if (error.message?.includes('addAccount')) {
    console.error('\n💡 The SDK might not expose addAccount directly.');
    console.error('   Try using demo mode for now: localStorage.setItem("demo-mode", "true")');
  }
  process.exit(1);
});
