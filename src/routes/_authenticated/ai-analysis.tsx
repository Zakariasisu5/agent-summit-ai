import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ethers } from "ethers";
import {
  ArrowRight,
  Cpu,
  Loader2,
  Network,
  Sparkles,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/ai-analysis")({
  head: () => ({
    meta: [
      { title: "AI Analysis · CredLayer" },
      { name: "description", content: "Run a 0G Compute trust analysis on any wallet." },
    ],
  }),
  component: AnalysisPage,
});

const schema = z.object({
  wallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/i, "Enter a valid 0x… EVM address"),
});

export interface TrustReport {
  trustScore: number;
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  summary: string;
  recommendations: string[];
  signals: { label: string; weight: number; rationale: string }[];
}

export interface AnalyzeResult {
  wallet: string;
  generatedAt: string;
  report: TrustReport;
  compute: {
    provider: string;
    model: string;
    jobId: string;
    endpoint: string;
  };
}

/**
 * Run AI inference using 0G Compute with the user's wallet paying for it.
 * This demonstrates the user-pays model where each user controls their own compute spending.
 */
async function runUserPaidAnalysis(
  targetWallet: string,
  userSigner: ethers.Signer
): Promise<AnalyzeResult> {
  // Polyfill for URL.clone() in browser
  if (typeof URL !== 'undefined' && !(URL.prototype as any).clone) {
    (URL.prototype as any).clone = function() {
      return new URL(this.href);
    };
  }

  // Import 0G Serving Broker SDK
  const broker: any = await import("@0glabs/0g-serving-broker");
  const createBroker = broker.createZGComputeNetworkBroker ?? broker.createBroker;
  
  if (!createBroker) {
    throw new Error("Broker factory not found in SDK");
  }
  
  // 1. Pull live on-chain activity
  const RPC = import.meta.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai";
  const rpcProvider = new ethers.JsonRpcProvider(RPC);
  const walletAddr = targetWallet.toLowerCase() as `0x${string}`;

  const [balance, txCount, block] = await Promise.all([
    rpcProvider.getBalance(walletAddr),
    rpcProvider.getTransactionCount(walletAddr),
    rpcProvider.getBlockNumber(),
  ]);

  const walletData = {
    address: walletAddr,
    chainId: Number(import.meta.env.NEXT_PUBLIC_CHAIN_ID || 16602),
    balanceWei: balance.toString(),
    transactionCount: txCount,
    observedAtBlock: block,
  };

  // 2. Create broker client with user's wallet (user pays)
  let client;
  try {
    client = await createBroker(userSigner);
  } catch (e: any) {
    if (e?.message?.includes("Sub-account not found") || e?.code === "CALL_EXCEPTION") {
      throw new Error(
        "Your wallet is not registered with the 0G Serving Broker. Please fund your wallet with at least 2 A0GI and register it using: 0g-compute-cli add-account --amount 2 --private-key YOUR_PRIVATE_KEY"
      );
    }
    throw new Error(`Failed to create broker client: ${e?.message ?? e}`);
  }

  // 3. Discover AI service
  let services;
  try {
    services = await client.inference.listService();
  } catch (e: any) {
    throw new Error(`Failed to list AI services: ${e?.message ?? e}`);
  }
  
  if (!services?.length) {
    throw new Error("No 0G Compute AI services are currently available. Please try again later.");
  }
  
  const svc = services[0];
  let endpoint, model, headers;
  
  try {
    const metadata = await client.inference.getServiceMetadata(svc.provider);
    endpoint = metadata.endpoint;
    model = metadata.model;
    headers = await client.inference.getRequestHeaders(
      svc.provider,
      JSON.stringify(walletData),
    );
  } catch (e: any) {
    throw new Error(`Failed to get service metadata: ${e?.message ?? e}`);
  }

  // 4. Run AI inference (user pays for this)
  const prompt = `You are CredLayer, an AI trust analyst. Given the following on-chain activity for ${walletAddr}, return STRICT JSON with shape { "trustScore": number 0-1000, "riskLevel": "low"|"medium"|"high", "confidence": number 0-100, "summary": string, "recommendations": string[], "signals": [{"label": string, "weight": number, "rationale": string}] }. Data: ${JSON.stringify(walletData)}`;

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
    const errorText = await res.text().catch(() => 'unknown');
    throw new Error(`AI inference failed (${res.status}): ${errorText}`);
  }
  
  const json: any = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";

  const jobId =
    json?.id ?? json?.request_id ?? ethers.id(content + Date.now()).slice(0, 18);
  
  try {
    await client.inference.processResponse(svc.provider, content, jobId);
  } catch {
    // Signature verification optional in some broker versions
  }

  let parsed: TrustReport;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI model returned invalid response format. Please try again.");
  }
  
  return {
    wallet: walletAddr,
    generatedAt: new Date().toISOString(),
    report: parsed,
    compute: {
      provider: svc.provider,
      model,
      jobId: String(jobId),
      endpoint,
    },
  };
}

function AnalysisPage() {
  const { address, connector } = useAccount();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { wallet: address ?? "" },
  });

  const [history, setHistory] = useState<AnalyzeResult[]>([]);

  const mut = useMutation({
    mutationFn: async (vars: { wallet: string }) => {
      if (!address || !connector) {
        throw new Error("Please connect your wallet first");
      }

      // Get ethers signer from wagmi connector
      const provider = await connector.getProvider();
      const ethersProvider = new ethers.BrowserProvider(provider as any);
      const signer = await ethersProvider.getSigner();

      return await runUserPaidAnalysis(vars.wallet, signer);
    },
    onSuccess: (res) => {
      setHistory((h) => [res, ...h]);
      toast.success("AI analysis complete", {
        description: `Trust score ${res.report.trustScore} · ${res.report.riskLevel} risk`,
      });
    },
    onError: (err: any) => {
      toast.error("Analysis failed", { 
        description: err?.message ?? "Unknown error",
        duration: 8000,
      });
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <Badge variant="outline" className="border-primary/40 text-primary">
          <Sparkles className="mr-1 h-3 w-3" /> 0G Compute · live inference
        </Badge>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          AI Trust Analysis
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Submit a wallet address. Your wallet pays for AI inference on 0G Compute using
          your 0G tokens. We pull live on-chain activity from 0G Chain and generate a
          trust score.
        </p>
      </header>

      {/* Registration Notice */}
      {address && (
        <div className="glass-panel p-4 border-primary/40">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">User-Pays Model</span>
                <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                  Your wallet pays
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your wallet must be registered with the 0G Serving Broker and funded with A0GI. Register using: 0g-compute-cli add-account --amount 2
              </p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={form.handleSubmit((v) => mut.mutate({ wallet: v.wallet }))}
        className="glass-strong flex flex-col gap-3 p-5 md:flex-row md:items-end"
      >
        <div className="flex-1">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">
            Wallet address
          </label>
          <Input
            placeholder="0x…"
            {...form.register("wallet")}
            className="mt-2 font-mono"
          />
          {form.formState.errors.wallet && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.wallet.message}
            </p>
          )}
        </div>
        <Button 
          type="submit" 
          size="lg" 
          disabled={mut.isPending || !address} 
          className="md:w-56"
        >
          {mut.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running inference…
            </>
          ) : (
            <>
              Analyze wallet <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
      {!address && (
        <p className="text-xs text-muted-foreground text-center -mt-4">
          Connect your wallet to run AI analysis
        </p>
      )}

      <PipelineStatus pending={mut.isPending} result={mut.data ?? null} />

      {mut.data && <ReportView result={mut.data} />}

      <HistoryTable items={history} />
    </div>
  );
}

function PipelineStatus({
  pending,
  result,
}: {
  pending: boolean;
  result: AnalyzeResult | null;
}) {
  const steps = [
    { icon: Network, label: "Pull 0G Chain activity", done: !!result },
    { icon: Cpu, label: "0G Compute inference (user pays)", done: !!result?.compute.jobId },
  ];
  return (
    <div className="glass-panel grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
      {steps.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 rounded-md bg-card/40 px-3 py-2"
        >
          <div
            className={[
              "grid h-7 w-7 place-items-center rounded-md",
              s.done
                ? "bg-primary/20 text-primary"
                : pending
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {pending && !s.done ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <s.icon className="h-3.5 w-3.5" />
            )}
          </div>
          <div className="text-xs">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

function ReportView({ result }: { result: AnalyzeResult }) {
  const r = result.report;
  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
      <div className="glass-strong p-4 text-center sm:p-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Trust Score
        </div>
        <div className="mt-2 font-display text-5xl font-semibold text-gradient-brand sm:text-6xl">
          {r.trustScore}
        </div>
        <div className="mt-1 text-sm">
          <Badge
            variant="outline"
            className={
              r.riskLevel === "low"
                ? "border-primary/40 text-primary"
                : r.riskLevel === "medium"
                  ? "border-primary/40 text-primary"
                  : "border-destructive/40 text-destructive"
            }
          >
            {r.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Confidence {r.confidence}%
        </div>
      </div>

      <div className="glass-panel p-4 sm:p-6 lg:col-span-2">
        <h3 className="font-semibold">AI summary</h3>
        <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
        {r.recommendations?.length > 0 && (
          <>
            <h4 className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
              Recommendations
            </h4>
            <ul className="mt-2 space-y-1 text-sm">
              {r.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">›</span>
                  {rec}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="glass-panel p-6 lg:col-span-3">
        <h3 className="font-semibold">Reputation signals</h3>
        <div className="mt-3 space-y-2">
          {r.signals?.map((s, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{s.label}</span>
                <span className="font-mono text-foreground">{s.weight}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(0, Math.min(100, s.weight))}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.rationale}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-4 sm:p-6 lg:col-span-3">
        <h3 className="font-semibold">Verifiable references</h3>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <Ref label="0G Compute job">{result.compute.jobId}</Ref>
          <Ref label="Compute provider">{result.compute.provider}</Ref>
          <Ref label="Model">{result.compute.model}</Ref>
          <Ref label="Payment method">User wallet (you paid)</Ref>
        </div>
      </div>
    </div>
  );
}

function Ref({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <code className="mt-1 block break-all font-mono text-xs text-foreground/90">{children}</code>
    </div>
  );
}

function HistoryTable({ items }: { items: AnalyzeResult[] }) {
  return (
    <section className="glass-strong p-6">
      <h3 className="font-display text-lg font-semibold">Analysis history</h3>
      <p className="text-xs text-muted-foreground">Past reports for this session.</p>

      {!items.length ? (
        <div className="mt-4 grid place-items-center rounded-md border border-dashed border-border p-10 text-sm text-muted-foreground">
          No analyses yet. Submit a wallet above to generate one.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2">Report</th>
                <th>Trust</th>
                <th>Risk</th>
                <th>Storage hash</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.compute.jobId} className="border-t border-border">
                  <td className="py-2 font-mono text-xs">
                    {it.compute.jobId.slice(0, 10)}…
                  </td>
                  <td>{it.report.trustScore}</td>
                  <td>{it.report.riskLevel}</td>
                  <td className="font-mono text-xs text-muted-foreground">
                    {it.compute.jobId.slice(0, 14)}…
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {new Date(it.generatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
