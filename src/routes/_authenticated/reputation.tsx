import { createFileRoute } from "@tanstack/react-router";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES, ReputationRegistryABI } from "@/contracts";
import { Gauge } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reputation")({
  head: () => ({ meta: [{ title: "Reputation · CredLayer" }] }),
  component: ReputationPage,
});

function ReputationPage() {
  const { address } = useAccount();
  const { data, isLoading, error } = useReadContract({
    abi: ReputationRegistryABI,
    address: CONTRACT_ADDRESSES.reputation || undefined,
    functionName: "getTrustScore",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESSES.reputation },
  });

  const score = data ? Number((data as any)[0]) : 0;
  const updatedAt = data ? Number((data as any)[1]) : 0;
  const reportHash = data ? ((data as any)[2] as string) : "";
  const storageURI = data ? ((data as any)[3] as string) : "";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Reputation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The latest AI-generated trust score for your wallet, read directly from
          ReputationRegistry on 0G Chain.
        </p>
      </header>

      {!CONTRACT_ADDRESSES.reputation ? (
        <div className="glass-panel p-10 text-center text-sm text-muted-foreground">
          ReputationRegistry contract is not deployed yet. Set{" "}
          <code className="font-mono">NEXT_PUBLIC_CONTRACT_REPUTATION</code> after deployment.
        </div>
      ) : isLoading ? (
        <div className="glass-panel h-64 animate-pulse" />
      ) : error ? (
        <div className="glass-panel p-6 text-sm text-destructive">
          {(error as Error).message}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-strong col-span-1 p-6 text-center">
            <Gauge className="mx-auto h-6 w-6 text-primary" />
            <div className="mt-3 font-display text-6xl font-semibold text-gradient-brand">
              {score || "—"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              out of 1000 · {score >= 700 ? "Low risk" : score >= 400 ? "Medium" : score ? "High" : "No score"}
            </div>
          </div>

          <div className="glass-panel md:col-span-2 space-y-3 p-6 text-sm">
            <Row label="Updated">
              {updatedAt ? new Date(updatedAt * 1000).toLocaleString() : "—"}
            </Row>
            <Row label="Report hash">
              <code className="break-all font-mono text-xs">{reportHash || "—"}</code>
            </Row>
            <Row label="Storage URI">
              <code className="break-all font-mono text-xs">{storageURI || "—"}</code>
            </Row>
            <Row label="Contract">
              <code className="break-all font-mono text-xs">{CONTRACT_ADDRESSES.reputation}</code>
            </Row>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-3 border-b border-border/60 pb-3 last:border-0">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}
