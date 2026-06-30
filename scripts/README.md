# 0G Compute Setup Scripts

## Problem

When running AI analysis, you may encounter this error:

```
Failed to get service metadata or headers: Sub-account not found. 
Initialize it by transferring funds via "transfer-fund"
```

This means your wallet has A0GI tokens, but you haven't deposited them into the 0G Compute broker's internal ledger system.

## Solution

### Step 1: Get Testnet Tokens

Your compute wallet needs **at least 3 A0GI** to create the initial ledger account with the broker.

1. Go to the 0G faucet: https://faucet.0g.ai
2. Enter your compute wallet address: `0x343D2E876DE0741129ab44553a65827a8f06C818`
   - This address is from your `ZG_COMPUTE_PRIVATE_KEY` in `.env`
3. Request tokens
4. Wait for the transaction to confirm

**Note**: The faucet may have daily limits. If you can't get enough from the faucet, you may need to:
- Try again the next day
- Ask in the 0G Discord for testnet tokens
- Transfer from another funded wallet

### Step 2: Initialize Broker Account

Once your wallet has at least 3 A0GI, run:

```bash
node scripts/init-broker-account.mjs
```

This script will:
1. Check your wallet balance
2. Connect to the 0G Compute broker
3. Deposit 3 A0GI into your broker sub-account
4. Verify the deposit was successful

### Step 3: Verify

After the script completes successfully, try running AI analysis again from your application. The inference requests should now work.

## How It Works

The 0G Compute broker uses a prepaid model:

1. **Your Wallet** → Has A0GI tokens (regular blockchain balance)
2. **Broker Ledger** → Internal accounting system within the broker contract
3. **Inference Requests** → Deduct fees from your broker ledger balance

Think of it like depositing money into an exchange or app wallet before you can use it.

### Why 3 A0GI Minimum?

The broker contract requires a minimum deposit of 3 A0GI when creating a new ledger account. This is a contract-level requirement to ensure accounts have sufficient balance for operations.

After the initial 3 A0GI deposit, you can add smaller amounts if needed.

## Troubleshooting

### "Insufficient balance" Error

**Problem**: Your wallet doesn't have enough A0GI

**Solution**: 
1. Check your current balance:
   ```bash
   node -e "const ethers = require('ethers'); const p = new ethers.JsonRpcProvider('https://evmrpc-testnet.0g.ai'); p.getBalance('0x343D2E876DE0741129ab44553a65827a8f06C818').then(b => console.log(ethers.formatEther(b), 'A0GI'))"
   ```
2. Get more tokens from the faucet (see Step 1 above)

### Transaction Fails

**Problem**: The deposit transaction fails or reverts

**Possible causes**:
- Network congestion (try again in a few minutes)
- Gas price too low (the script automatically handles this)
- Contract issue (check 0G status page or Discord)

**Solution**: Wait a few minutes and try again

### "Account already initialized" Message

**Problem**: You've already created a ledger account

**Solution**: This is actually good! Your account is set up. The original error should be resolved.

If you still see the error, check your broker balance:
```javascript
// In a Node.js script
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const signer = new ethers.Wallet(process.env.ZG_COMPUTE_PRIVATE_KEY, provider);
const broker = await createZGComputeNetworkBroker(signer);
const account = await broker.inference.getAccount();
console.log("Broker balance:", account);
```

## Alternative: Manual Contract Interaction

If the script doesn't work for some reason, you can interact with the broker contract directly:

1. Get the broker contract address from the SDK (it's `0xa48f01287233509FD694a22Bf840225062E67836`)
2. Use a block explorer or ethers.js to call `depositFund()` with 3 A0GI value
3. Confirm the transaction

## More Information

- **0G Documentation**: https://docs.0g.ai
- **0G Compute Network**: https://build.0g.ai/compute
- **Your Compute Wallet**: `0x343D2E876DE0741129ab44553a65827a8f06C818`
- **Broker Contract**: `0xa48f01287233509FD694a22Bf840225062E67836`
