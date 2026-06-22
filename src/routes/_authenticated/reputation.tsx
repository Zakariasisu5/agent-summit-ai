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
          Your AI-generated trust score, read directly from ReputationRegistry on 0G Chain.
        </p>
      </header>

      {isLoading ? (
        <div className="glass-panel h-64 animate-pulse" />
      ) : error ? (
        <div className="glass-panel p-6 text-sm text-destructive">
          {(error as Error).message}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-strong col-span-full p-6 text-center md:col-span-1">
            <Gauge className="mx-auto h-6 w-6 text-primary" />
            <div className="mt-3 font-display text-5xl font-semibold text-primary sm:text-6xl">
              {score || "0"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              out of 1000 · {score >= 700 ? "Low risk" : score >= 400 ? "Medium" : score > 0 ? "High" : "No score yet"}
            </div>
          </div>

          <div className="glass-panel col-span-full space-y-3 p-4 text-sm sm:p-6 md:col-span-2">
            <Row label="Updated">
              {updatedAt ? new Date(updatedAt * 1000).toLocaleString() : "Never"}
            </Row>
            <Row label="Report hash">
              <code className="break-all font-mono text-xs">{reportHash || "N/A"}</code>
            </Row>
            <Row label="Storage URI">
              <code className="break-all font-mono text-xs">{storageURI || "N/A"}</code>
            </Row>
            <Row label="Contract">
              <a 
                href={`https://chainscan-galileo.0g.ai/address/${CONTRACT_ADDRESSES.reputation}`}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-xs text-primary hover:underline"
              >
                {CONTRACT_ADDRESSES.reputation}
              </a>
            </Row>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-start gap-2 border-b border-border/60 pb-3 last:border-0 sm:grid-cols-[140px_1fr] sm:gap-3">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="break-words">{children}</div>
    </div>
  );
}
