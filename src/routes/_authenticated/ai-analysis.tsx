import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAccount } from "wagmi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Cpu,
  Database,
  Loader2,
  Network,
  ScanFace,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { analyzeWallet, type AnalyzeResult } from "@/lib/trust.functions";

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

function AnalysisPage() {
  const { address } = useAccount();
  const analyze = useServerFn(analyzeWallet);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { wallet: address ?? "" },
  });

  const [history, setHistory] = useState<AnalyzeResult[]>([]);

  const mut = useMutation({
    mutationFn: (vars: { wallet: string }) => analyze({ data: vars }),
    onSuccess: (res) => {
      setHistory((h) => [res, ...h]);
      toast.success("AI analysis complete", {
        description: `Trust score ${res.report.trustScore} · ${res.report.riskLevel} risk`,
      });
    },
    onError: (err: any) => {
      toast.error("Analysis failed", { description: err?.message ?? "Unknown error" });
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
          Submit a wallet address. We pull live on-chain activity from 0G Chain, run an
          AI inference job on 0G Compute, persist the full report on 0G Storage, and
          anchor the score in ReputationRegistry.
        </p>
      </header>

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
        <Button type="submit" size="lg" disabled={mut.isPending} className="md:w-56">
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
    { icon: Cpu, label: "0G Compute inference", done: !!result?.compute.jobId },
    { icon: Database, label: "Persist on 0G Storage", done: !!result?.storage.rootHash },
    { icon: ScanFace, label: "Anchor on 0G Chain", done: !!result?.chain.txHash },
  ];
  return (
    <div className="glass-panel grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
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
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="glass-strong p-6 text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Trust Score
        </div>
        <div className="mt-2 font-display text-6xl font-semibold text-gradient-brand">
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

      <div className="glass-panel p-6 lg:col-span-2">
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

      <div className="glass-panel p-6 lg:col-span-3">
        <h3 className="font-semibold">Verifiable references</h3>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
          <Ref label="0G Compute job">{result.compute.jobId}</Ref>
          <Ref label="Compute provider">{result.compute.provider}</Ref>
          <Ref label="Model">{result.compute.model}</Ref>
          <Ref label="0G Storage root">{result.storage.rootHash}</Ref>
          <Ref label="Storage tx">{result.storage.txHash}</Ref>
          <Ref label="On-chain tx">{result.chain.txHash ?? "(contract not deployed)"}</Ref>
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
                <tr key={it.storage.rootHash} className="border-t border-border">
                  <td className="py-2 font-mono text-xs">
                    {it.storage.rootHash.slice(0, 10)}…
                  </td>
                  <td>{it.report.trustScore}</td>
                  <td>{it.report.riskLevel}</td>
                  <td className="font-mono text-xs text-muted-foreground">
                    {it.storage.rootHash.slice(0, 14)}…
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
