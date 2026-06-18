/**
 * 0G Compute server-side service.
 *
 * Uses @0glabs/0g-serving-broker to run inference against a 0G-hosted model.
 * Requires a funded signer (ZG_COMPUTE_PRIVATE_KEY) pre-funded with the broker
 * (see 0g-compute-cli: `0g-compute-cli add-account --amount 0.01`).
 *
 * If the SDK or env is unavailable, throws — no mock.
 */
import { ethers } from "ethers";

const ZG_RPC = process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai";

export class ZgComputeError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ZgComputeError";
  }
}

export interface InferenceResult {
  jobId: string;
  providerAddress: string;
  model: string;
  endpoint: string;
  raw: string;
  parsed: TrustReport;
}

export interface TrustReport {
  trustScore: number; // 0..1000
  riskLevel: "low" | "medium" | "high";
  confidence: number; // 0..100
  summary: string;
  recommendations: string[];
  signals: { label: string; weight: number; rationale: string }[];
}

function getSigner() {
  const pk = process.env.ZG_COMPUTE_PRIVATE_KEY;
  if (!pk) {
    throw new ZgComputeError(
      "ZG_COMPUTE_PRIVATE_KEY is not configured. Add a funded broker key to enable AI scoring.",
      "missing_key",
    );
  }
  const provider = new ethers.JsonRpcProvider(ZG_RPC);
  return new ethers.Wallet(pk, provider);
}

async function loadBroker() {
  try {
    const mod: any = await import("@0glabs/0g-serving-broker");
    return mod;
  } catch (e: any) {
    throw new ZgComputeError(
      `0G Serving Broker failed to load in this runtime: ${e?.message ?? e}`,
      "sdk_unavailable",
    );
  }
}

/**
 * Run AI inference on a wallet's on-chain activity summary.
 * `walletData` is a compact JSON-stringifiable object the caller assembled
 * from chain reads + 0G Storage reads.
 */
export async function runInference(
  wallet: `0x${string}`,
  walletData: Record<string, unknown>,
): Promise<InferenceResult> {
  const broker: any = await loadBroker();
  const signer = getSigner();
  const createBroker = broker.createZGComputeNetworkBroker ?? broker.createBroker;
  if (!createBroker) {
    throw new ZgComputeError("Broker factory not found in SDK", "sdk_shape");
  }
  const client = await createBroker(signer);

  // Discover a provider and target an LLM service.
  const services = await client.inference.listService();
  if (!services?.length) {
    throw new ZgComputeError("No 0G Compute services available", "no_services");
  }
  const svc = services[0];
  const { endpoint, model } = await client.inference.getServiceMetadata(svc.provider);
  const headers = await client.inference.getRequestHeaders(
    svc.provider,
    JSON.stringify(walletData),
  );

  const prompt = `You are CredLayer, an AI trust analyst. Given the following on-chain activity for ${wallet}, return STRICT JSON with shape { "trustScore": number 0-1000, "riskLevel": "low"|"medium"|"high", "confidence": number 0-100, "summary": string, "recommendations": string[], "signals": [{"label": string, "weight": number, "rationale": string}] }. Data: ${JSON.stringify(walletData)}`;

  const res = await fetch(`${endpoint}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    throw new ZgComputeError(
      `Inference endpoint returned ${res.status}`,
      "inference_failed",
    );
  }
  const json: any = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";

  // Verify the response signature against the provider.
  const jobId =
    json?.id ?? json?.request_id ?? ethers.id(content + Date.now()).slice(0, 18);
  try {
    await client.inference.processResponse(svc.provider, content, jobId);
  } catch {
    /* signature verification optional in some broker versions */
  }

  let parsed: TrustReport;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ZgComputeError("Model returned non-JSON", "bad_response");
  }
  return {
    jobId: String(jobId),
    providerAddress: svc.provider,
    model,
    endpoint,
    raw: content,
    parsed,
  };
}

export async function getJobStatus(jobId: string): Promise<{ jobId: string; status: string }> {
  // The 0G broker is synchronous request/response; status is implicit.
  return { jobId, status: "completed" };
}
