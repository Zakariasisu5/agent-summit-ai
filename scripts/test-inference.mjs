/**
 * Simple test script to verify 0G Compute inference works end-to-end
 */

// Apply URL.clone() polyfill first
if (typeof URL !== 'undefined' && !URL.prototype.clone) {
  URL.prototype.clone = function() {
    return new URL(this.href);
  };
  console.log('✅ URL.clone() polyfill applied\n');
}

import { ethers } from "ethers";
import { config } from "dotenv";

config();

const TEST_WALLET = "0x6264F847c7D6A4916619e85267e429db4c5E337c";

console.log("🧪 Testing 0G Compute Inference\n");
console.log("=" .repeat(60));

async function testInference() {
  try {
    // Step 1: Check environment
    console.log("\n📋 Step 1: Checking environment...");
    const requiredVars = ['ZG_COMPUTE_PRIVATE_KEY', 'NEXT_PUBLIC_0G_RPC_URL'];
    for (const v of requiredVars) {
      if (!process.env[v]) {
        throw new Error(`Missing ${v} in .env`);
      }
    }
    console.log("✅ Environment variables present");

    // Step 2: Check wallet balance
    console.log("\n💰 Step 2: Checking compute wallet balance...");
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_0G_RPC_URL
    );
    const signer = new ethers.Wallet(process.env.ZG_COMPUTE_PRIVATE_KEY, provider);
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    console.log(`   Address: ${address}`);
    console.log(`   Balance: ${ethers.formatEther(balance)} A0GI`);

    // Step 3: Check broker account
    console.log("\n🔍 Step 3: Checking broker account...");
    const { createZGComputeNetworkBroker } = await import("@0glabs/0g-serving-broker");
    const broker = await createZGComputeNetworkBroker(signer);
    console.log("✅ Broker client created");
    
    try {
      const ledger = await broker.ledger.getLedger();
      console.log("✅ Broker account initialized");
      console.log(`   Balance: ${ethers.formatEther(ledger[1])} A0GI`);
    } catch (e) {
      throw new Error(`Broker not initialized: ${e.message}`);
    }

    // Step 4: List available services
    console.log("\n🎯 Step 4: Listing available inference services...");
    const services = await broker.inference.listService();
    console.log(`✅ Found ${services.length} service(s)`);
    if (services.length === 0) {
      throw new Error("No inference services available");
    }
    const svc = services[0];
    console.log(`   Provider: ${svc.provider}`);

    // Step 5: Get service metadata
    console.log("\n📡 Step 5: Getting service metadata...");
    const metadata = await broker.inference.getServiceMetadata(svc.provider);
    console.log(`✅ Service metadata retrieved`);
    console.log(`   Endpoint: ${metadata.endpoint}`);
    console.log(`   Model: ${metadata.model}`);

    // Step 6: Prepare request
    console.log("\n📝 Step 6: Preparing inference request...");
    const walletData = {
      address: TEST_WALLET,
      transactionCount: 5,
      balanceWei: "1000000000000000000",
      hasIdentity: true,
      timestamp: Date.now(),
    };
    
    const prompt = `You are CredLayer, an AI trust analyst. Given the following on-chain activity for ${TEST_WALLET}, return STRICT JSON with shape { "trustScore": number 0-1000, "riskLevel": "low"|"medium"|"high", "confidence": number 0-100, "summary": string, "recommendations": string[], "signals": [{"label": string, "weight": number, "rationale": string}] }. Data: ${JSON.stringify(walletData)}`;

    const headers = await broker.inference.getRequestHeaders(
      svc.provider,
      JSON.stringify(walletData)
    );
    console.log("✅ Request headers obtained");

    // Step 7: Send inference request
    console.log("\n🧠 Step 7: Sending inference request...");
    console.log("   This may take 10-30 seconds...");
    
    const response = await fetch(`${metadata.endpoint}/v1/chat/completions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...headers 
      },
      body: JSON.stringify({
        model: metadata.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Inference failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in inference response");
    }

    console.log("✅ Inference completed!");

    // Step 8: Parse and display results
    console.log("\n📊 Step 8: Parsing results...");
    const parsed = JSON.parse(content);
    console.log("✅ Results parsed successfully");
    
    // Display summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 AI INFERENCE TEST SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("\n📊 Trust Analysis Results:");
    console.log(`   Wallet: ${TEST_WALLET}`);
    console.log(`   Trust Score: ${parsed.trustScore}/1000`);
    console.log(`   Risk Level: ${parsed.riskLevel}`);
    console.log(`   Confidence: ${parsed.confidence}%`);
    console.log(`   Summary: ${parsed.summary}`);
    
    if (parsed.recommendations && parsed.recommendations.length > 0) {
      console.log(`\n   Recommendations:`);
      parsed.recommendations.forEach((rec, i) => {
        console.log(`     ${i + 1}. ${rec}`);
      });
    }
    
    if (parsed.signals && parsed.signals.length > 0) {
      console.log(`\n   Trust Signals:`);
      parsed.signals.slice(0, 3).forEach((sig) => {
        console.log(`     • ${sig.label} (weight: ${sig.weight})`);
        console.log(`       ${sig.rationale}`);
      });
    }

    console.log("\n✅ All components working correctly!");
    console.log("   - Broker account: Active");
    console.log("   - Inference service: Available");
    console.log("   - AI model: Responding");
    console.log("   - Result parsing: Success");

  } catch (error) {
    console.error("\n❌ TEST FAILED");
    console.error("=".repeat(60));
    console.error("Error:", error.message);
    
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    
    console.error("\n💡 Debugging hints:");
    if (error.message.includes("Sub-account")) {
      console.error("   - Run: npm run broker:init");
    } else if (error.message.includes("url.clone")) {
      console.error("   - Polyfill issue - check URL.prototype.clone");
    } else if (error.message.includes("Broker not initialized")) {
      console.error("   - Run: npm run broker:init");
    } else if (error.message.includes("Missing")) {
      console.error("   - Check .env file configuration");
    }
    
    process.exit(1);
  }
}

testInference();
