# 🛡️ CredLayer — Trust Layer for AI Agents & Decentralized Identity

> **Built for the 0G Zero Cup Hackathon**  
> Verifiable reputation for users and AI agents — scored by AI on 0G Compute, stored on 0G Storage, anchored on 0G Chain.

[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-blue)](https://credlayer0g.vercel.app)
[![0G Galileo](https://img.shields.io/badge/⛓️-0G%20Galileo-purple)](https://chainscan-galileo.0g.ai)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 🎯 The Problem

In the emerging age of autonomous AI agents, **trust is everything**:
- How do you know if an AI agent or wallet address is trustworthy?
- How can reputation be **verifiable, portable, and tamper-proof**?
- Traditional centralized systems can't serve a decentralized agent economy.

**CredLayer solves this** by building a composable trust layer where every reputation score is:
✅ **AI-generated** (0G Compute inference)  
✅ **Verifiably stored** (0G Storage with Merkle proofs)  
✅ **On-chain anchored** (0G Chain smart contracts)

---

## 🌟 What Makes This Special

### 🔥 Full 0G Stack Integration
We're not just using one 0G service — **we use all three primitives**:

| 0G Primitive | How We Use It | Why It Matters |
|--------------|---------------|----------------|
| **0G Chain** | `ReputationRegistry`, `IdentityRegistry`, `CredentialRegistry` smart contracts | Immutable on-chain reputation anchoring |
| **0G Storage** | AI analysis reports + credential documents with Merkle root proofs | Decentralized, verifiable data layer |
| **0G Compute** | LLM-based trust scoring with signed provider responses | Decentralized AI inference you can audit |

### 🤖 Built for the Agent Era
- **Universal Identity**: One wallet address = one reputation (human or AI agent)
- **Cross-Platform Trust**: Any dApp, protocol, or agent can read scores
- **Verifiable AI**: Every inference is cryptographically signed by the compute provider

### 🔐 Fully Auditable Pipeline
```
Wallet Activity → 0G Compute (AI inference) → 0G Storage (report) → 0G Chain (anchor)
       ↓                    ↓                         ↓                    ↓
   On-chain tx       Signed response            Merkle root         Registry update
```

---

## 🏗️ Architecture

### Smart Contracts (0G Chain — Galileo Testnet)
```solidity
ReputationRegistry.sol    // Trust scores (0-1000) with metadata
IdentityRegistry.sol      // DID anchoring and profile management
CredentialRegistry.sol    // Document hash verification
```

**Chain ID**: 16601  
**Explorer**: [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai)

### Tech Stack
- **Frontend**: React 19, TanStack Start (SSR), TailwindCSS, Framer Motion
- **Smart Contracts**: Solidity (deployed to 0G Chain)
- **Web3**: wagmi, viem, RainbowKit
- **Storage**: 0G Storage SDK with Merkle proof verification
- **Compute**: 0G Serving Broker for decentralized inference
- **Deployment**: Vercel (Nitro SSR)

---

## ✨ Key Features

### 🎯 AI Trust Scoring
- **0–1000 score** derived from on-chain activity analysis
- Multi-dimensional scoring: wallet age, transaction patterns, counterparty quality, sybil detection
- Every score includes **confidence percentage** and **risk assessment**

### 🔍 Credential Verification
- Upload any document (KYC, attestation, certificate)
- Hash stored on 0G Storage with full Merkle path proof
- Anyone can verify: `download from storage → rehash → compare root`

### 🌐 Agent Reputation Graph
- AI agents use wallet addresses just like humans
- Shared reputation layer enables agent-to-agent trust
- Cross-ecosystem identity portability

### 📊 Transparency Dashboard
- View live trust scores and historical changes
- Inspect 0G Storage roots and transaction hashes
- Download full AI analysis reports with provider signatures

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
npm or bun
MetaMask or compatible wallet
```

### Installation
```bash
# Clone the repo
git clone https://github.com/Zakariasisu5/agent-summit-ai.git
cd agent-summit-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your RPC URLs, 0G Storage endpoints, etc.

# Run development server
npm run dev
```

### Deploy Smart Contracts
```bash
cd services/contracts
# Deploy to 0G Galileo testnet (chain ID 16601)
# Update contract addresses in src/contracts/index.ts
```

---

## 🎬 How It Works

### 1️⃣ Connect Wallet
User connects their EVM wallet (MetaMask, Coinbase, etc.) to 0G Galileo testnet.

### 2️⃣ Generate Trust Score
- Frontend calls backend API with wallet address
- Backend triggers **0G Compute inference job** with activity data
- AI model (e.g., Llama 3.1) analyzes patterns and returns signed score
- Report uploaded to **0G Storage** → returns Merkle root hash
- Score written to **ReputationRegistry** contract with storage root

### 3️⃣ Verify Anywhere
- Any dApp reads `getReputation(address)` from the registry
- Full AI report downloaded from 0G Storage using root hash
- Merkle proof verified byte-for-byte

---

## 🏆 Why CredLayer Wins

### ✅ Complete 0G Integration
Unlike projects that only touch one service, we leverage the **entire 0G stack** in a real production flow.

### ✅ Real-World Use Case
Trust and reputation aren't just nice-to-haves — they're **critical infrastructure** for Web3 and autonomous agents.

### ✅ Production-Ready Code
- Full TypeScript implementation
- Smart contracts with proper error handling
- SSR with TanStack Start for performance
- Professional UI/UX with accessibility

### ✅ Novel AI + Crypto Synergy
We don't just store data — we use **decentralized AI to generate verifiable insights** that live permanently on-chain.

### ✅ Scalable Architecture
- Modular contract design (separate registries)
- Efficient storage (only root hashes on-chain)
- Cacheable inference results

---

## 📸 Screenshots

### Landing Page
![Hero Section](https://via.placeholder.com/800x400?text=Hero+Section+-+Trust+Layer+for+AI+Agents)

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Trust+Score+Dashboard+-+847+%2F+1000)

### AI Analysis Report
![AI Report](https://via.placeholder.com/800x400?text=AI+Trust+Analysis+Report)

---

## 🔗 Links

- **Live Demo**: [credlayer0g.vercel.app](https://credlayer0g.vercel.app)
- **Repository**: [github.com/Zakariasisu5/agent-summit-ai](https://github.com/Zakariasisu5/agent-summit-ai)
- **Contracts (Explorer)**: [View on 0G Chain Explorer](https://chainscan-galileo.0g.ai)
- **Documentation**: [0G Docs](https://docs.0g.ai)

---

## 🛠️ Technical Highlights

### Smart Contract Innovation
```solidity
// ReputationRegistry.sol
struct Reputation {
    uint16 score;           // 0-1000
    uint32 timestamp;       // Last update
    bytes32 storageRoot;    // 0G Storage Merkle root
    address computeProvider; // Who ran the inference
    bytes signature;        // Provider signature
}
```

### 0G Storage Integration
```typescript
// Upload AI report to 0G Storage
const file = new File([reportJson], "report.json");
const [tree, uploaded] = await indexer.upload(file);
const rootHash = tree.rootHash(); // Merkle root
// Store rootHash on-chain for verification
```

### 0G Compute Workflow
```typescript
// Request inference from 0G Compute
const response = await broker.getService(settlementAddress, {
  prompt: `Analyze trust score for wallet ${address}...`,
  model: "llama-3.1-8b-instruct"
});
// response.signature verifies provider signed this
```

---

## 🎓 What We Learned

- **0G Storage** Merkle proof system is incredibly elegant for verifiable data
- **0G Compute** signed responses enable trustless AI inference
- Combining all three 0G primitives creates powerful composability
- Agent economies need shared reputation infrastructure

---

## 🔮 Future Roadmap

- [ ] **Multi-chain reputation aggregation** (bridge to other EVMs)
- [ ] **Agent-to-agent trust negotiation protocol**
- [ ] **Reputation staking** (lock tokens to boost score)
- [ ] **Privacy-preserving ZK proofs** for selective disclosure
- [ ] **DAO governance** for scoring model parameters
- [ ] **Reputation NFTs** (tradeable trust positions)

---

## 👥 Team

Built with ❤️ for the 0G Zero Cup Hackathon

---

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

- **0G Foundation** for the incredible infrastructure primitives
- **TanStack** for the powerful React framework
- **RainbowKit** for elegant wallet connections
- The entire **0G community** for support and inspiration

---

<div align="center">

### 🌟 If you believe in decentralized trust, give us a star! 🌟

**Built on 0G Chain · 0G Storage · 0G Compute**

[🚀 Try Live Demo](https://credlayer0g.vercel.app) • [📖 Read Docs](https://docs.0g.ai) • [🔗 View on Explorer](https://chainscan-galileo.0g.ai)

</div>
