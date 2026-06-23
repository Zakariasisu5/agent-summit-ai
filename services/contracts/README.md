# CredLayer Contracts

Three permissionless registries that back the CredLayer dApp on the
**0G Galileo testnet**. All sources live in `services/contracts/src/`.

| Contract             | Purpose                                              | Source                          |
| -------------------- | ---------------------------------------------------- | ------------------------------- |
| `IdentityRegistry`   | One on-chain identity per address (metadata URI).    | `src/IdentityRegistry.sol`      |
| `ReputationRegistry` | Latest AI trust score + report commitment per user.  | `src/ReputationRegistry.sol`    |
| `CredentialRegistry` | Append-only log of credentials per owner.            | `src/CredentialRegistry.sol`    |

All three are Solidity `^0.8.24`, MIT-licensed, and have **no constructor
arguments**, **no owner**, **no upgradeability**, and **no fees**. Deployment
is just `CREATE` + transaction receipt — there is no post-deploy
`initialize()` call. State is empty on first block; the UI handles the
empty-state correctly.

---

## Network

| Field        | Value                                  |
| ------------ | -------------------------------------- |
| Network      | 0G Galileo Testnet                     |
| Chain ID     | `16602`                                |
| RPC URL      | `https://evmrpc-testnet.0g.ai`         |
| Native token | `0G` (faucet: <https://faucet.0g.ai>)  |
| Explorer     | `https://chainscan-galileo.0g.ai`      |

---

## Deployed addresses (Galileo)

Deployer: `0x6264F847c7D6A4916619e85267e429db4c5E337c`

| Contract             | Address                                      |
| -------------------- | -------------------------------------------- |
| `IdentityRegistry`   | `0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7` |
| `ReputationRegistry` | `0x6AF03aAc6CB8339AE1486c7B6D2Dd72e8FB3a397` |
| `CredentialRegistry` | `0x1Bda18E14bDB064261044412e324be513A8A3f41` |

The canonical record (including ABIs and deploy tx hashes) is at
`deployments/0g-galileo.json`.

---

## Wired environment variables

`scripts/deploy-0g.mjs` writes these into `.env.local` (and `.env.example`
documents them):

```bash
NEXT_PUBLIC_CHAIN_ID=16602
NEXT_PUBLIC_0G_RPC_URL=https://evmrpc-testnet.0g.ai

NEXT_PUBLIC_CONTRACT_IDENTITY=0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7
NEXT_PUBLIC_CONTRACT_REPUTATION=0x6AF03aAc6CB8339AE1486c7B6D2Dd72e8FB3a397
NEXT_PUBLIC_CONTRACT_CREDENTIAL=0x1Bda18E14bDB064261044412e324be513A8A3f41

# Mirror for Vite-prefixed reads (src/contracts/index.ts checks both)
VITE_CONTRACT_IDENTITY=0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7
VITE_CONTRACT_REPUTATION=0x6AF03aAc6CB8339AE1486c7B6D2Dd72e8FB3a397
VITE_CONTRACT_CREDENTIAL=0x1Bda18E14bDB064261044412e324be513A8A3f41
```

---

## Contract surface

### IdentityRegistry

```solidity
function createIdentity(string metadataURI) external;
function getIdentity(address user) external view
    returns (bool exists, string metadataURI, uint256 createdAt);

event IdentityCreated(address indexed user, string metadataURI);
event IdentityUpdated(address indexed user, string metadataURI);
```

`createIdentity` is idempotent — first call emits `IdentityCreated`, repeat
calls overwrite `metadataURI` and emit `IdentityUpdated`. No allowlist.

### ReputationRegistry

```solidity
function updateReputation(
    address user,
    uint16 trustScore,        // 0..1000
    bytes32 reportHash,       // keccak256 of canonical report JSON
    string storageURI         // 0G Storage URI (e.g. 0g://<root>)
) external;

function getTrustScore(address user) external view
    returns (uint16 score, uint256 updatedAt, bytes32 reportHash, string storageURI);

event ReputationUpdated(
    address indexed user,
    uint16 trustScore,
    bytes32 reportHash,
    string storageURI
);
```

On testnet `msg.sender` must equal `user` (self-write only). `trustScore` is
bounded to `[0, 1000]`. The pair `(reportHash, storageURI)` is the on-chain
commitment of the off-chain AI report so a verifier can re-derive the score
from the source data.

### CredentialRegistry

```solidity
function registerCredential(bytes32 credentialHash, string storageURI) external;
function verifyCredential(address owner, bytes32 credentialHash) external view returns (bool);
function getCredential(address owner, uint256 index) external view
    returns (bytes32 credentialHash, string storageURI, uint256 registeredAt);
function credentialCount(address owner) external view returns (uint256);

event CredentialRegistered(
    address indexed owner,
    bytes32 indexed credentialHash,
    string storageURI,
    uint256 index
);
```

Append-only per owner. Duplicate hashes for the same owner revert with
`AlreadyRegistered()`.

---

## Deploying

Requirements: `bun`, a funded Galileo wallet, and `DEPLOYER_PRIVATE_KEY` in
your shell (never commit it).

```bash
# 1. Compile + deploy all three contracts, write artifacts and env vars
bun run deploy:0g
```

What the script does:

1. Compiles each `*.sol` with `solc` (loaded on demand via `bun add -d solc`).
2. Connects to `NEXT_PUBLIC_0G_RPC_URL` using `ethers.Wallet(DEPLOYER_PRIVATE_KEY)`.
3. Sends three `CREATE` transactions (no constructor args) and waits for
   receipts.
4. Writes:
   - `deployments/0g-galileo.json` — addresses, ABIs, tx hashes, deployer,
     chain id, block numbers, timestamp.
   - `src/contracts/abis/{IdentityRegistry,ReputationRegistry,CredentialRegistry}.json`
     — per-contract ABI files imported by the frontend.
   - `.env.local` — `VITE_CONTRACT_*` and `NEXT_PUBLIC_CONTRACT_*` set to the
     fresh addresses.
5. Prints a summary table with explorer links.

There is **no `initialize()` step** — the contracts are stateless on deploy
and ready for the first user write.

---

## Frontend integration

`src/contracts/index.ts` exports the ABIs and reads the addresses from
`VITE_CONTRACT_*` / `NEXT_PUBLIC_CONTRACT_*`. Components use them via
`useReadContract` / `useWriteContract` (wagmi) and `ethers.queryFilter` for
event history. After a fresh deploy, the UI will show empty states until the
first AI Analysis writes a score.
