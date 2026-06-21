# CredLayer Smart Contracts

Three Solidity contracts on 0G Chain Galileo testnet (chainId `16601`).

- `IdentityRegistry.sol` — wallet-anchored identity records
- `ReputationRegistry.sol` — AI-generated trust scores (oracle-write)
- `CredentialRegistry.sol` — credential hash anchors

## Deploy

These are intentionally a skeleton for the first pass. Deploy with Foundry,
Hardhat, or Remix against `https://evmrpc-testnet.0g.ai`. Once deployed,
populate these env vars on Vercel and locally:

```
NEXT_PUBLIC_CONTRACT_IDENTITY=0x...
NEXT_PUBLIC_CONTRACT_REPUTATION=0x...
NEXT_PUBLIC_CONTRACT_CREDENTIAL=0x...
```

The signer behind `ZG_COMPUTE_PRIVATE_KEY` must be passed as the
constructor `_oracle` arg for `ReputationRegistry`, because only that
oracle is allowed to write trust scores produced by the server-side
0G Compute job.

ABIs consumed by the frontend live in `src/contracts/index.ts`.
