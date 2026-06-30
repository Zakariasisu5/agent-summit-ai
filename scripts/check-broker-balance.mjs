/**
 * Check your 0G Compute broker account balance and status.
 */
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { config } from "dotenv";

// Load environment variables
config();

const ZG_RPC = process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai";
const PRIVATE_KEY = process.env.ZG_COMPUTE_PRIVATE_KEY;

async function main() {
  if (!PRIVATE_KEY) {
    console.error("❌ ZG_COMPUTE_PRIVATE_KEY not found in environment");
    process.exit(1);
  }

  console.log("🔍 Checking 0G Compute account status...\n");

  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(ZG_RPC);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const address = await signer.getAddress();

  console.log(`📍 Wallet Address: ${address}`);
  
  // Check wallet balance
  const balance = await provider.getBalance(address);
  const balanceInEther = ethers.formatEther(balance);
  console.log(`💰 Wallet Balance: ${balanceInEther} A0GI`);
  console.log(`   (This is your regular blockchain balance)\n`);

  try {
    // Create broker client
    console.log("📡 Connecting to 0G Compute broker...");
    const broker = await createZGComputeNetworkBroker(signer);
    console.log("✅ Connected\n");

    // Try to get ledger info
    try {
      const ledgerInfo = await broker.ledger.getLedger();
      console.log("📊 Broker Ledger Account:");
      console.log(`   Status: ✅ Initialized`);
      console.log(`   Ledger Info:`, ledgerInfo);
      console.log("");
    } catch (e) {
      console.log("📊 Broker Ledger Account:");
      console.log(`   Status: ❌ Not initialized`);
      console.log(`   Error:`, e.message);
      console.log("");
      console.log("💡 To initialize your broker account:");
      console.log(`   1. Get at least 3 A0GI tokens from https://faucet.0g.ai`);
      console.log(`   2. Run: node scripts/init-broker-account.mjs`);
      console.log("");
    }

    // Try to get inference account info
    try {
      const account = await broker.inference.getAccount();
      console.log("🧠 Inference Account:");
      console.log(`   Status: ✅ Active`);
      console.log(`   Account:`, account);
      console.log("");
    } catch (e) {
      console.log("🧠 Inference Account:");
      console.log(`   Status: ⚠️  ${e.message}`);
      console.log("");
    }

    // List available services
    try {
      const services = await broker.inference.listService();
      console.log("🎯 Available Inference Services:");
      if (services && services.length > 0) {
        services.forEach((svc, i) => {
          console.log(`   ${i + 1}. Provider: ${svc.provider}`);
          console.log(`      Type: ${svc.serviceType || 'inference'}`);
        });
      } else {
        console.log("   No services available");
      }
      console.log("");
    } catch (e) {
      console.log("🎯 Available Inference Services:");
      console.log(`   ⚠️  ${e.message}`);
      console.log("");
    }

    console.log("✨ Status check complete!");

  } catch (error) {
    console.error("\n❌ Error checking broker status:");
    console.error(error.message);
    process.exit(1);
  }
}

main().catch(console.error);
