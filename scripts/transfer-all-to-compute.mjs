/**
 * Transfer ALL A0GI tokens (minus gas) to the compute wallet.
 * 
 * Use this when you want to consolidate all funds from another wallet
 * into your compute wallet.
 */
import { ethers } from "ethers";

const ZG_RPC = "https://evmrpc-testnet.0g.ai";

// Source wallet (has tokens)
const FROM_PRIVATE_KEY = process.env.FROM_PRIVATE_KEY; // You need to set this

// Destination wallet (compute wallet that needs funds)
const TO_ADDRESS = "0x343D2E876DE0741129ab44553a65827a8f06C818";

async function main() {
  console.log("💸 Transfer All A0GI to Compute Wallet\n");

  if (!FROM_PRIVATE_KEY) {
    console.error("❌ Error: FROM_PRIVATE_KEY not set");
    console.error("\nUsage:");
    console.error(`   FROM_PRIVATE_KEY=0xyour_private_key node scripts/transfer-all-to-compute.mjs\n`);
    console.error("Example:");
    console.error(`   FROM_PRIVATE_KEY=0x123abc... node scripts/transfer-all-to-compute.mjs\n`);
    process.exit(1);
  }

  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(ZG_RPC);
  const signer = new ethers.Wallet(FROM_PRIVATE_KEY, provider);
  const fromAddress = await signer.getAddress();

  console.log(`📤 From: ${fromAddress}`);
  console.log(`📥 To:   ${TO_ADDRESS}\n`);

  // Check source balance
  const balance = await provider.getBalance(fromAddress);
  const balanceEther = ethers.formatEther(balance);
  console.log(`Source wallet balance: ${balanceEther} A0GI`);

  if (balance === 0n) {
    console.error(`\n❌ Source wallet is empty!`);
    process.exit(1);
  }

  // Check destination balance (before)
  const destBalanceBefore = await provider.getBalance(TO_ADDRESS);
  const destBalanceBeforeEther = ethers.formatEther(destBalanceBefore);
  console.log(`Compute wallet balance: ${destBalanceBeforeEther} A0GI\n`);

  try {
    // Estimate gas for the transfer
    console.log("⛽ Estimating gas cost...");
    const gasLimit = 21000n; // Standard ETH transfer
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits("50", "gwei");
    const gasCost = gasLimit * gasPrice;
    
    console.log(`   Gas limit: ${gasLimit.toString()}`);
    console.log(`   Gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);
    console.log(`   Est. cost: ${ethers.formatEther(gasCost)} A0GI\n`);

    // Calculate amount to send (balance - gas)
    if (balance <= gasCost) {
      console.error("❌ Balance too low to cover gas fees!");
      console.error(`   Balance: ${balanceEther} A0GI`);
      console.error(`   Gas:     ${ethers.formatEther(gasCost)} A0GI`);
      process.exit(1);
    }

    const amountToSend = balance - gasCost;
    const amountToSendEther = ethers.formatEther(amountToSend);
    
    console.log(`💰 Transferring: ${amountToSendEther} A0GI`);
    console.log(`   (keeping ${ethers.formatEther(gasCost)} A0GI for gas)\n`);

    // Send transaction
    console.log("🔄 Sending transaction...");
    const tx = await signer.sendTransaction({
      to: TO_ADDRESS,
      value: amountToSend,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    });

    console.log(`✅ Transaction sent!`);
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Explorer: https://chainscan-galileo.0g.ai/tx/${tx.hash}`);
    console.log(`\n⏳ Waiting for confirmation...`);

    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}\n`);

    // Check final balances
    const destBalanceAfter = await provider.getBalance(TO_ADDRESS);
    const destBalanceAfterEther = ethers.formatEther(destBalanceAfter);
    const sourceBalanceAfter = await provider.getBalance(fromAddress);
    const sourceBalanceAfterEther = ethers.formatEther(sourceBalanceAfter);
    
    console.log("📊 Transfer Summary:");
    console.log(`   Amount sent:      ${amountToSendEther} A0GI`);
    console.log(`   Gas used:         ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} A0GI`);
    console.log(`   Source remaining: ${sourceBalanceAfterEther} A0GI`);
    console.log(`   Compute balance:  ${destBalanceAfterEther} A0GI`);

    if (parseFloat(destBalanceAfterEther) >= 3.0) {
      console.log("\n🎉 Transfer complete! You now have enough to initialize the broker.");
      console.log("\n📝 Next steps:");
      console.log("   1. Run: npm run broker:check");
      console.log("   2. Run: npm run broker:init");
    } else {
      console.log("\n⚠️  Transfer complete, but you still need more tokens.");
      console.log(`   Current: ${destBalanceAfterEther} A0GI`);
      console.log(`   Need:    3.0 A0GI minimum`);
      console.log(`   Missing: ${(3.0 - parseFloat(destBalanceAfterEther)).toFixed(4)} A0GI`);
      console.log("\n   Get more tokens from: https://faucet.0g.ai");
    }

  } catch (error) {
    console.error("\n❌ Transfer failed:");
    console.error(error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  }
}

main().catch(console.error);
