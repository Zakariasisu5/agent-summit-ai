# Contract Deployment Instructions

## Quick Start

### 1. Install Dependencies
```bash
cd contracts
npm install
```

### 2. Set Environment Variables
Create a `.env` file in the `contracts` directory:
```bash
# Required: Your deployer private key (funded with 0G testnet tokens)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Optional: Oracle key for ReputationRegistry (defaults to deployer if not set)
ZG_COMPUTE_PRIVATE_KEY=your_oracle_private_key_here

# Network settings (defaults shown)
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_CHAIN_ID=16602
```

### 3. Get Testnet Tokens
Visit the [0G Faucet](https://faucet.0g.ai) to get testnet tokens for your deployer address.

### 4. Deploy Contracts
```bash
npm run deploy
```

### 5. Update Application Config
Copy the output contract addresses to your main `.env` file in the project root:
```bash
NEXT_PUBLIC_CONTRACT_IDENTITY=0x...
NEXT_PUBLIC_CONTRACT_REPUTATION=0x...
NEXT_PUBLIC_CONTRACT_CREDENTIAL=0x...
```

---

## Detailed Steps

### Step 1: Prepare Wallet

1. **Create or Export a Wallet:**
   - Using MetaMask: Account Details → Export Private Key
   - Using a new wallet: `npx ethers-cli wallet create`

2. **Add 0G Galileo Testnet to MetaMask:**
   - Network Name: `0G Galileo Testnet`
   - RPC URL: `https://evmrpc-testnet.0g.ai`
   - Chain ID: `16602`
   - Currency Symbol: `0G`
   - Block Explorer: `https://chainscan-galileo.0g.ai`

3. **Get Testnet Tokens:**
   - Visit: https://faucet.0g.ai
   - Enter your deployer address
   - Request tokens (you'll need ~0.1 0G for deployment)

### Step 2: Configure Oracle

The `ReputationRegistry` contract requires an oracle address (the backend signer that will update trust scores).

**Option A:** Use the same key for deployment and oracle (simple, for testing):
```bash
# In contracts/.env
DEPLOYER_PRIVATE_KEY=0x123...
# Oracle will default to deployer address
```

**Option B:** Use separate keys (recommended, for production):
```bash
# In contracts/.env
DEPLOYER_PRIVATE_KEY=0x123...      # One-time deployment key
ZG_COMPUTE_PRIVATE_KEY=0xabc...    # Backend server key (oracle)
```

The backend server at `ZG_COMPUTE_PRIVATE_KEY` will be the **only** address allowed to call `updateReputation()`.

### Step 3: Deploy

```bash
cd contracts
npm install
npm run deploy
```

**Expected Output:**
```
🚀 Deploying CredLayer contracts to 0G Galileo testnet...

Deployer address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Deployer balance: 1.5 0G
Network: unknown
Chain ID: 16602n

Oracle address (from ZG_COMPUTE_PRIVATE_KEY): 0x8F...

📝 Deploying IdentityRegistry...
✅ IdentityRegistry deployed to: 0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7

📝 Deploying ReputationRegistry...
✅ ReputationRegistry deployed to: 0x6AF03aAc6CB8339AE1486c7B6D2Dd72e8FB3a397

📝 Deploying CredentialRegistry...
✅ CredentialRegistry deployed to: 0x1Bda18E14bDB064261044412e324be513A8A3f41

🎉 All contracts deployed successfully!

═══════════════════════════════════════════════
📋 Contract Addresses:
═══════════════════════════════════════════════
IdentityRegistry    : 0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7
ReputationRegistry  : 0x6AF03aAc6CB8339AE1486c7B6D2Dd72e8FB3a397
CredentialRegistry  : 0x1Bda18E14bDB064261044412e324be513A8A3f41
═══════════════════════════════════════════════
```

### Step 4: Verify Deployment

1. **Check on Explorer:**
   - Visit https://chainscan-galileo.0g.ai
   - Search for each contract address
   - Verify contract bytecode is deployed

2. **Run Tests (Optional):**
   ```bash
   npm run test
   ```

3. **Save `deployment.json`:**
   - The deployment script creates `deployment.json` with all addresses
   - Keep this file for reference

### Step 5: Update Frontend

1. **Update `.env` in project root:**
   ```bash
   NEXT_PUBLIC_CHAIN_ID=16602
   NEXT_PUBLIC_CONTRACT_IDENTITY=0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7
   NEXT_PUBLIC_CONTRACT_REPUTATION=0x6AF03aAc6CB8339AE1486c7B6D2Dd72e8FB3a397
   NEXT_PUBLIC_CONTRACT_CREDENTIAL=0x1Bda18E14bDB064261044412e324be513A8A3f41
   ```

2. **Update `.env.example`:**
   ```bash
   NEXT_PUBLIC_CONTRACT_IDENTITY=0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7
   NEXT_PUBLIC_CONTRACT_REPUTATION=0x6AF03aAc6CB8339AE1486c7B6D2Dd72e8FB3a397
   NEXT_PUBLIC_CONTRACT_CREDENTIAL=0x1Bda18E14bDB064261044412e324be513A8A3f41
   ```

3. **Update `README.md`:**
   - Add contract addresses to the main README
   - Update chain ID if changed

4. **Restart Development Server:**
   ```bash
   npm run dev
   ```

---

## Troubleshooting

### Error: "insufficient funds for intrinsic transaction cost"
**Solution:** Your deployer address needs more testnet tokens. Visit the faucet again.

### Error: "nonce too low"
**Solution:** Clear Hardhat cache and try again:
```bash
npm run clean
npm run deploy
```

### Error: "network does not support ENS"
**Solution:** This is a warning and can be ignored. Deployment should still succeed.

### Contracts deployed but frontend shows "Contract not configured"
**Solution:** 
1. Check that environment variables are set correctly
2. Restart your development server (`npm run dev`)
3. Clear browser cache and reload

### "Only oracle can update reputation" error in backend
**Solution:** Make sure the backend uses the same private key as specified in `ZG_COMPUTE_PRIVATE_KEY` during deployment.

---

## Redeploying

If you need to redeploy contracts (e.g., after making changes):

1. **Compile new contracts:**
   ```bash
   npm run compile
   ```

2. **Deploy again:**
   ```bash
   npm run deploy
   ```

3. **Update all references to old contract addresses:**
   - Frontend `.env` files
   - Vercel environment variables
   - Documentation files
   - Any hardcoded addresses in tests

---

## Production Deployment Checklist

Before deploying to production/mainnet:

- [ ] Audit all contract code
- [ ] Run comprehensive test suite
- [ ] Use a hardware wallet or multi-sig for deployment
- [ ] Use separate keys for deployment vs. oracle operations
- [ ] Set up monitoring for oracle transactions
- [ ] Implement role-based access control for oracle key
- [ ] Consider timelock for contract upgrades
- [ ] Verify contracts on block explorer
- [ ] Document all contract addresses securely
- [ ] Set up alerts for unusual on-chain activity
- [ ] Implement emergency pause mechanism (if needed)

---

## Network Information

**0G Galileo Testnet:**
- Chain ID: 16602
- RPC: https://evmrpc-testnet.0g.ai
- Explorer: https://chainscan-galileo.0g.ai
- Faucet: https://faucet.0g.ai
- Currency: 0G (testnet tokens)

---

## Support

For issues or questions:
- Check the [0G Documentation](https://docs.0g.ai)
- View contract source in `contracts/` folder
- Check existing GitHub issues
- Join the 0G Discord community
