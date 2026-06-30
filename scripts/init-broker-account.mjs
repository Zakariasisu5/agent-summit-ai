/**
 * Initialize 0G Compute broker sub-account by depositing funds.
 * 
 * This script transfers funds from your wallet to your sub-account within
 * the 0G Compute broker contract, enabling you to pay for inference requests.
 */
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { config } from "dotenv";

// Load environment variables
config();

const ZG_RPC = process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai";
const PRIVATE_KEY = process.env.ZG_COMPUTE_PRIVATE_KEY;
const DEPOSIT_AMOUNT = "3.0"; // Amount in A0GI to deposit (minimum required for initial ledger)

async function main() {
  if (!PRIVATE_KEY) {
    console.error("❌ ZG_COMPUTE_PRIVATE_KEY not found in environment");
    process.exit(1);
  }

  console.log("🔄 Initializing 0G Compute broker account...\n");

  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(ZG_RPC);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const address = await signer.getAddress();

  console.log(`Wallet Address: ${address}`);
  
  // Check wallet balance
  const balance = await provider.getBalance(address);
  const balanceInEther = ethers.formatEther(balance);
  console.log(`Wallet Balance: ${balanceInEther} A0GI\n`);

  if (parseFloat(balanceInEther) < parseFloat(DEPOSIT_AMOUNT)) {
    console.error(`❌ Insufficient balance. Need at least ${DEPOSIT_AMOUNT} A0GI`);
    console.error(`   Current balance: ${balanceInEther} A0GI`);
    console.error(`   Get testnet tokens from: https://faucet.0g.ai`);
    console.error(`   Use your compute address: ${address}`);
    process.exit(1);
  }

  try {
    // Create broker client
    console.log("📡 Connecting to 0G Compute broker...");
    const broker = await createZGComputeNetworkBroker(signer);
    console.log("✅ Connected to broker\n");

    // Check if we can get account info
    try {
      const account = await broker.getAccount();
      console.log("📊 Current Account Info:");
      console.log(`   Provider: ${account?.provider || 'Not set'}`);
      console.log(`   Balance: ${account?.balance || '0'}`);
      console.log("");
    } catch (e) {
      console.log("ℹ️  Account not initialized yet\n");
    }

    // Inspect broker structure
    console.log("🔍 Inspecting broker object structure...\n");
    console.log("Broker keys:", Object.keys(broker));
    
    // Check for nested objects
    if (broker.ledger) {
      console.log("broker.ledger keys:", Object.keys(broker.ledger));
      console.log("broker.ledger methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(broker.ledger)));
    }
    if (broker.inference) {
      console.log("broker.inference keys:", Object.keys(broker.inference));
      console.log("broker.inference methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(broker.inference)));
    }
    if (broker.fineTuning) {
      console.log("broker.fineTuning keys:", Object.keys(broker.fineTuning));
    }
    
    // Add funds to broker account
    console.log(`\n💰 Attempting to deposit ${DEPOSIT_AMOUNT} A0GI to broker sub-account...`);
    
    // Try ledger methods - depositFund expects a number, not BigInt
    if (broker.ledger && broker.ledger.depositFund) {
      console.log("   Using broker.ledger.depositFund()...");
      const tx = await broker.ledger.depositFund(parseFloat(DEPOSIT_AMOUNT));
      console.log(`   Transaction hash: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);
      await tx.wait();
    } else {
      console.error("❌ Could not find depositFund method on broker.ledger");
      process.exit(1);
    }

    console.log("✅ Funds deposited successfully!\n");

    // Verify new account balance
    try {
      const account = await broker.getAccount();
      console.log("📊 Updated Account Info:");
      console.log(`   Balance: ${account?.balance || 'Unknown'}`);
    } catch (e) {
      console.log("ℹ️  Could not retrieve updated balance");
    }

    console.log("\n🎉 Broker account initialization complete!");
    console.log("   You can now run AI inference requests.");

  } catch (error) {
    console.error("\n❌ Error initializing broker account:");
    console.error(error.message);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch(console.error);
