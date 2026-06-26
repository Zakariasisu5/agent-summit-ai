/**
 * Register compute account with 0G Serving Broker
 * This transfers a small amount to the broker to initialize your sub-account
 */

import { ethers } from 'ethers';

const RPC_URL = 'https://evmrpc-testnet.0g.ai';
const BROKER_ADDRESS = '0xa48f01287233509FD694a22Bf840225062E67836';
const COMPUTE_PRIVATE_KEY = process.env.ZG_COMPUTE_PRIVATE_KEY || '0xb3048e0e69f96ed3028e5c91bae8a760283361e5809ad3e14257dd09f827ebed';
const AMOUNT = '0.01'; // Amount in A0GI to register

async function registerAccount() {
  console.log('🔧 Registering compute account with 0G Serving Broker...\n');
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(COMPUTE_PRIVATE_KEY, provider);
  
  console.log('📍 Your compute wallet:', wallet.address);
  console.log('📍 Broker contract:', BROKER_ADDRESS);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Current balance:', ethers.formatEther(balance), 'A0GI\n');
  
  if (balance < ethers.parseEther(AMOUNT)) {
    console.error('❌ Insufficient balance! Need at least', AMOUNT, 'A0GI');
    console.error('   Fund your wallet first:', wallet.address);
    process.exit(1);
  }
  
  // Send transaction to broker
  console.log('📤 Sending', AMOUNT, 'A0GI to broker to initialize account...');
  
  const tx = await wallet.sendTransaction({
    to: BROKER_ADDRESS,
    value: ethers.parseEther(AMOUNT),
  });
  
  console.log('⏳ Transaction sent:', tx.hash);
  console.log('   Waiting for confirmation...');
  
  const receipt = await tx.wait();
  
  console.log('\n✅ Account registered successfully!');
  console.log('📋 Transaction hash:', receipt.hash);
  console.log('🔗 View on explorer:', `https://chainscan-galileo.0g.ai/tx/${receipt.hash}`);
  console.log('\n🎉 You can now use AI Analysis in production mode!');
}

registerAccount().catch((error) => {
  console.error('\n❌ Registration failed:', error.message);
  process.exit(1);
});
