const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CredLayer contracts to 0G Galileo testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "0G");
  console.log("Network:", (await hre.ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("");

  // Determine oracle address (for ReputationRegistry)
  let oracleAddress = deployer.address;
  if (process.env.ZG_COMPUTE_PRIVATE_KEY) {
    const oracleWallet = new hre.ethers.Wallet(process.env.ZG_COMPUTE_PRIVATE_KEY);
    oracleAddress = oracleWallet.address;
    console.log("Oracle address (from ZG_COMPUTE_PRIVATE_KEY):", oracleAddress);
  } else {
    console.log("Oracle address (using deployer):", oracleAddress);
    console.log("⚠️  Warning: ZG_COMPUTE_PRIVATE_KEY not set, using deployer as oracle");
  }
  console.log("");

  // Deploy IdentityRegistry
  console.log("📝 Deploying IdentityRegistry...");
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identity = await IdentityRegistry.deploy();
  await identity.waitForDeployment();
  const identityAddress = await identity.getAddress();
  console.log("✅ IdentityRegistry deployed to:", identityAddress);
  console.log("");

  // Deploy ReputationRegistry
  console.log("📝 Deploying ReputationRegistry...");
  const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
  const reputation = await ReputationRegistry.deploy(oracleAddress);
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("✅ ReputationRegistry deployed to:", reputationAddress);
  console.log("");

  // Deploy CredentialRegistry
  console.log("📝 Deploying CredentialRegistry...");
  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const credential = await CredentialRegistry.deploy();
  await credential.waitForDeployment();
  const credentialAddress = await credential.getAddress();
  console.log("✅ CredentialRegistry deployed to:", credentialAddress);
  console.log("");

  console.log("🎉 All contracts deployed successfully!\n");
  console.log("═══════════════════════════════════════════════");
  console.log("📋 Contract Addresses:");
  console.log("═══════════════════════════════════════════════");
  console.log("IdentityRegistry    :", identityAddress);
  console.log("ReputationRegistry  :", reputationAddress);
  console.log("CredentialRegistry  :", credentialAddress);
  console.log("═══════════════════════════════════════════════\n");

  console.log("📝 Add these to your .env and .env.example:");
  console.log("═══════════════════════════════════════════════");
  console.log(`NEXT_PUBLIC_CONTRACT_IDENTITY=${identityAddress}`);
  console.log(`NEXT_PUBLIC_CONTRACT_REPUTATION=${reputationAddress}`);
  console.log(`NEXT_PUBLIC_CONTRACT_CREDENTIAL=${credentialAddress}`);
  console.log("═══════════════════════════════════════════════\n");

  console.log("🔗 View on Explorer:");
  console.log("═══════════════════════════════════════════════");
  console.log(`IdentityRegistry    : https://chainscan-galileo.0g.ai/address/${identityAddress}`);
  console.log(`ReputationRegistry  : https://chainscan-galileo.0g.ai/address/${reputationAddress}`);
  console.log(`CredentialRegistry  : https://chainscan-galileo.0g.ai/address/${credentialAddress}`);
  console.log("═══════════════════════════════════════════════\n");

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: "0G Galileo Testnet",
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    oracle: oracleAddress,
    timestamp: new Date().toISOString(),
    contracts: {
      IdentityRegistry: identityAddress,
      ReputationRegistry: reputationAddress,
      CredentialRegistry: credentialAddress,
    },
    explorerUrls: {
      IdentityRegistry: `https://chainscan-galileo.0g.ai/address/${identityAddress}`,
      ReputationRegistry: `https://chainscan-galileo.0g.ai/address/${reputationAddress}`,
      CredentialRegistry: `https://chainscan-galileo.0g.ai/address/${credentialAddress}`,
    },
  };

  fs.writeFileSync(
    "./deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✅ Deployment info saved to deployment.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
