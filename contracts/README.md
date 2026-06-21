# CredLayer Smart Contracts

> **Deployed to 0G Chain Galileo Testnet (Chain ID: 16602)**

Three core Solidity contracts that power the CredLayer trust infrastructure on 0G Chain.

## 📋 Contract Overview

| Contract | Address | Purpose |
|----------|---------|---------|
| **IdentityRegistry** | `0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7` | Wallet-anchored decentralized identity (DID) records |
| **ReputationRegistry** | `0x6AF03aAc6CB8339AE1486c7B6D2Dd72e8FB3a397` | AI-generated trust scores with storage proofs |
| **CredentialRegistry** | `0x1Bda18E14bDB064261044412e324be513A8A3f41` | Credential document hash anchoring |

**Network Details:**
- **Chain**: 0G Galileo Testnet
- **Chain ID**: 16602
- **RPC**: https://evmrpc-testnet.0g.ai
- **Explorer**: https://chainscan-galileo.0g.ai

---

## 📦 Contracts

### 1. IdentityRegistry.sol
Manages decentralized identity anchors for wallet addresses.

**Key Functions:**
```solidity
function createIdentity(string memory metadataURI) external
function getIdentity(address user) external view returns (bool exists, string memory metadataURI, uint256 createdAt)
```

**Events:**
```solidity
event IdentityCreated(address indexed user, string metadataURI)
```

**Use Cases:**
- Register wallet identity with metadata URI (IPFS/0G Storage)
- Query if an address has a registered identity
- Track identity creation timestamps

---

### 2. ReputationRegistry.sol
Stores AI-generated trust scores with verifiable 0G Storage references.

**Key Functions:**
```solidity
function updateReputation(
    address user,
    uint16 trustScore,
    bytes32 reportHash,
    string memory storageURI
) external onlyOracle

function getTrustScore(address user) external view returns (
    uint16 score,
    uint256 updatedAt,
    bytes32 reportHash,
    string memory storageURI
)
```

**Events:**
```solidity
event ReputationUpdated(
    address indexed user,
    uint16 trustScore,
    bytes32 reportHash,
    string storageURI
)
```

**Security:**
- Only the designated oracle address (server signer) can update scores
- Trust scores range from 0-1000
- Each update includes a hash of the full AI report and 0G Storage URI

**Use Cases:**
- Backend writes trust scores after 0G Compute inference
- Frontend reads user reputation in real-time
- Anyone can verify reports by downloading from storageURI and comparing reportHash

---

### 3. CredentialRegistry.sol
Anchors credential document hashes for verification.

**Key Functions:**
```solidity
function registerCredential(bytes32 credentialHash, string memory storageURI) external
function verifyCredential(address owner, bytes32 credentialHash) external view returns (bool)
function getCredential(address owner, uint256 index) external view returns (
    bytes32 credentialHash,
    string memory storageURI,
    uint256 registeredAt
)
function credentialCount(address owner) external view returns (uint256)
```

**Events:**
```solidity
event CredentialRegistered(
    address indexed owner,
    bytes32 indexed credentialHash,
    string storageURI
)
```

**Use Cases:**
- Users register credentials (KYC, attestations, certificates)
- Hash stored on-chain, full document on 0G Storage
- Anyone can verify document authenticity by re-hashing and comparing

---

## 🚀 Deployment Guide

### Prerequisites

- Node.js 18+ and npm/yarn
- Funded wallet with 0G testnet tokens ([Get from faucet](https://faucet.0g.ai))
- Private key with testnet tokens for deployment

### Option 1: Using Hardhat

1. **Install Hardhat:**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers
```

2. **Create `hardhat.config.js`:**
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    zgGalileo: {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  }
};
```

3. **Create deployment script `scripts/deploy.js`:**
```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  
  // Get oracle address (server signer for reputation updates)
  const oracleAddress = process.env.ZG_COMPUTE_PRIVATE_KEY 
    ? new hre.ethers.Wallet(process.env.ZG_COMPUTE_PRIVATE_KEY).address
    : deployer.address;
  
  console.log("Oracle address:", oracleAddress);

  // Deploy IdentityRegistry
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identity = await IdentityRegistry.deploy();
  await identity.waitForDeployment();
  console.log("IdentityRegistry deployed to:", await identity.getAddress());

  // Deploy ReputationRegistry
  const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
  const reputation = await ReputationRegistry.deploy(oracleAddress);
  await reputation.waitForDeployment();
  console.log("ReputationRegistry deployed to:", await reputation.getAddress());

  // Deploy CredentialRegistry
  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const credential = await CredentialRegistry.deploy();
  await credential.waitForDeployment();
  console.log("CredentialRegistry deployed to:", await credential.getAddress());
  
  console.log("\n✅ Deployment complete!");
  console.log("\nAdd these to your .env:");
  console.log(`NEXT_PUBLIC_CONTRACT_IDENTITY=${await identity.getAddress()}`);
  console.log(`NEXT_PUBLIC_CONTRACT_REPUTATION=${await reputation.getAddress()}`);
  console.log(`NEXT_PUBLIC_CONTRACT_CREDENTIAL=${await credential.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

4. **Deploy:**
```bash
DEPLOYER_PRIVATE_KEY=your_key npx hardhat run scripts/deploy.js --network zgGalileo
```

---

### Option 2: Using Foundry

1. **Install Foundry:**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **Initialize Foundry project:**
```bash
forge init --force
```

3. **Copy contracts to `src/` folder**

4. **Create `script/Deploy.s.sol`:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/IdentityRegistry.sol";
import "../src/ReputationRegistry.sol";
import "../src/CredentialRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address oracle = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        IdentityRegistry identity = new IdentityRegistry();
        console.log("IdentityRegistry:", address(identity));

        ReputationRegistry reputation = new ReputationRegistry(oracle);
        console.log("ReputationRegistry:", address(reputation));

        CredentialRegistry credential = new CredentialRegistry();
        console.log("CredentialRegistry:", address(credential));

        vm.stopBroadcast();
    }
}
```

5. **Deploy:**
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url https://evmrpc-testnet.0g.ai --broadcast --legacy
```

---

### Option 3: Using Remix IDE

1. Go to https://remix.ethereum.org
2. Create new files for each contract
3. Compile with Solidity 0.8.20+
4. Connect MetaMask to 0G Galileo testnet:
   - Network Name: 0G Galileo Testnet
   - RPC URL: https://evmrpc-testnet.0g.ai
   - Chain ID: 16602
   - Currency Symbol: 0G
   - Block Explorer: https://chainscan-galileo.0g.ai
5. Deploy contracts:
   - Deploy `IdentityRegistry` (no constructor args)
   - Deploy `ReputationRegistry` with oracle address
   - Deploy `CredentialRegistry` (no constructor args)
6. Copy deployed addresses

---

## 🔧 Post-Deployment Configuration

### 1. Update Environment Variables

Add to `.env` and `.env.example`:
```bash
NEXT_PUBLIC_CHAIN_ID=16602
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_CONTRACT_IDENTITY=0x...
NEXT_PUBLIC_CONTRACT_REPUTATION=0x...
NEXT_PUBLIC_CONTRACT_CREDENTIAL=0x...
```

### 2. Update Frontend Configuration

The contracts are automatically loaded from environment variables via `src/contracts/index.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  identity: getEnv("CONTRACT_IDENTITY"),
  reputation: getEnv("CONTRACT_REPUTATION"),
  credential: getEnv("CONTRACT_CREDENTIAL"),
};
```

### 3. Verify on Explorer

Visit the [0G Chain Explorer](https://chainscan-galileo.0g.ai) and search for your contract addresses to verify deployment.

---

## 📝 Contract ABIs

Minimal ABIs for frontend integration are exported from `src/contracts/index.ts`:
- `IdentityRegistryABI`
- `ReputationRegistryABI`
- `CredentialRegistryABI`

These ABIs include only the functions and events used by the frontend.

---

## 🔒 Security Considerations

### Oracle Pattern
The `ReputationRegistry` uses an oracle pattern where only a designated address can write scores:
```solidity
modifier onlyOracle() {
    require(msg.sender == oracle, "Only oracle can update reputation");
    _;
}
```

**Best Practices:**
- Keep oracle private key (`ZG_COMPUTE_PRIVATE_KEY`) secure
- Use separate keys for deployment vs. oracle operations
- Monitor oracle transactions on the block explorer
- Consider implementing a multi-sig or DAO for oracle key management in production

### Storage Hash Verification
All reputation reports and credentials include:
- `reportHash` / `credentialHash`: keccak256 of the document
- `storageURI`: 0G Storage reference (e.g., `0g://[rootHash]`)

**Verification Flow:**
1. Download document from 0G Storage using rootHash
2. Compute keccak256 hash of downloaded bytes
3. Compare with on-chain hash
4. If match → document is authentic and unmodified

---

## 🧪 Testing

### Local Testing with Hardhat

Create `test/CredLayer.test.js`:
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredLayer Contracts", function () {
  let identity, reputation, credential;
  let owner, oracle, user;

  beforeEach(async function () {
    [owner, oracle, user] = await ethers.getSigners();
    
    const Identity = await ethers.getContractFactory("IdentityRegistry");
    identity = await Identity.deploy();
    
    const Reputation = await ethers.getContractFactory("ReputationRegistry");
    reputation = await Reputation.deploy(oracle.address);
    
    const Credential = await ethers.getContractFactory("CredentialRegistry");
    credential = await Credential.deploy();
  });

  it("Should create identity", async function () {
    await identity.connect(user).createIdentity("ipfs://metadata");
    const [exists, uri] = await identity.getIdentity(user.address);
    expect(exists).to.be.true;
    expect(uri).to.equal("ipfs://metadata");
  });

  it("Should update reputation as oracle", async function () {
    await reputation.connect(oracle).updateReputation(
      user.address,
      850,
      ethers.id("report"),
      "0g://storage"
    );
    const [score] = await reputation.getTrustScore(user.address);
    expect(score).to.equal(850);
  });

  it("Should register credential", async function () {
    const hash = ethers.id("credential");
    await credential.connect(user).registerCredential(hash, "0g://cred");
    const verified = await credential.verifyCredential(user.address, hash);
    expect(verified).to.be.true;
  });
});
```

Run tests:
```bash
npx hardhat test
```

---

## 📚 Additional Resources

- [0G Chain Documentation](https://docs.0g.ai)
- [0G Galileo Explorer](https://chainscan-galileo.0g.ai)
- [Solidity Documentation](https://docs.soliditylang.org)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Foundry Book](https://book.getfoundry.sh)

---

## 🤝 Contributing

When modifying contracts:
1. Update the contract source files
2. Redeploy to testnet
3. Update contract addresses in `.env` files
4. Update ABIs in `src/contracts/index.ts` if interfaces change
5. Test thoroughly before mainnet deployment

---

## 📄 License

MIT License - See LICENSE file for details
