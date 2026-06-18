/**
 * Server functions exposed to the client for the AI Analysis flow.
 * Real 0G Compute → 0G Storage → 0G Chain pipeline runs inside .handler().
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ethers } from "ethers";

const analyzeInput = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const analyzeWallet = createServerFn({ method: "POST" })
  .inputValidator((d) => analyzeInput.parse(d))
  .handler(async ({ data }) => {
    const wallet = data.wallet.toLowerCase() as `0x${string}`;

    const RPC =
      process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai";
    const provider = new ethers.JsonRpcProvider(RPC);

    // 1. Pull live on-chain activity context for the wallet from 0G Chain.
    const [balance, txCount, block] = await Promise.all([
      provider.getBalance(wallet),
      provider.getTransactionCount(wallet),
      provider.getBlockNumber(),
    ]);

    const walletData = {
      address: wallet,
      chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 16601),
      balanceWei: balance.toString(),
      transactionCount: txCount,
      observedAtBlock: block,
    };

    // 2. Run real inference on 0G Compute.
    const { runInference } = await import("./zg-compute.server");
    const inference = await runInference(wallet, walletData);

    // 3. Store the full report on 0G Storage.
    const { uploadFile } = await import("./zg-storage.server");
    const reportJson = JSON.stringify({
      wallet,
      generatedAt: new Date().toISOString(),
      walletData,
      compute: {
        provider: inference.providerAddress,
        model: inference.model,
        jobId: inference.jobId,
      },
      report: inference.parsed,
    });
    const reportBytes = new TextEncoder().encode(reportJson);
    const reportHash = ethers.keccak256(reportBytes) as `0x${string}`;
    const upload = await uploadFile(reportBytes, `trust-${wallet}.json`);
    const storageURI = `0g://${upload.rootHash}`;

    // 4. Anchor on 0G Chain via the ReputationRegistry contract.
    const RR_ADDR = process.env.NEXT_PUBLIC_CONTRACT_REPUTATION as `0x${string}` | undefined;
    let onChainTx: string | null = null;
    if (RR_ADDR) {
      const { ReputationRegistryABI } = await import("@/contracts");
      const pk = process.env.ZG_COMPUTE_PRIVATE_KEY!;
      const wallet2 = new ethers.Wallet(pk, provider);
      const c = new ethers.Contract(RR_ADDR, ReputationRegistryABI as any, wallet2);
      const tx = await c.updateReputation(
        wallet,
        Math.max(0, Math.min(1000, Math.round(inference.parsed.trustScore))),
        reportHash,
        storageURI,
      );
      const rcpt = await tx.wait();
      onChainTx = rcpt?.hash ?? tx.hash;
    }

    return {
      wallet,
      generatedAt: new Date().toISOString(),
      report: inference.parsed,
      compute: {
        provider: inference.providerAddress,
        model: inference.model,
        jobId: inference.jobId,
        endpoint: inference.endpoint,
      },
      storage: {
        rootHash: upload.rootHash,
        storageURI,
        txHash: upload.txHash,
        size: upload.size,
        reportHash,
      },
      chain: {
        contract: RR_ADDR ?? null,
        txHash: onChainTx,
      },
    };
  });

export type AnalyzeResult = Awaited<ReturnType<typeof analyzeWallet>>;
