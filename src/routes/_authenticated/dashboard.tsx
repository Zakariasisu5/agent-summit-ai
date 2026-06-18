import { createFileRoute } from "@tanstack/react-router";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Database,
  FileCheck2,
  Gauge,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CONTRACT_ADDRESSES,
  ReputationRegistryABI,
  CredentialRegistryABI,
  contractsConfigured,
} from "@/contracts";
import { ZG_RPC_URL } from "@/lib/zg-chain";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · CredLayer" },
      { name: "description", content: "Your on-chain trust profile, credentials and AI analysis." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { address } = useAccount();
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live on-chain state for{" "}
          <span className="font-mono text-foreground">{address}</span>
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TrustScoreCard address={address} />
        <VerificationStatusCard address={address} />
        <CredentialCountCard address={address} />
        <ActivityCard address={address} />
      </div>

      <TrustTrend address={address} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "primary",
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "primary" | "accent" | "success" | "warning";
}) {
  const toneClass = {
    primary: "text-primary",
    accent: "text-primary",
    success: "text-primary",
    warning: "text-primary",
  }[tone];
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`grid h-8 w-8 place-items-center rounded-md bg-primary/10 ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={`mt-3 font-display text-3xl font-semibold ${toneClass}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function TrustScoreCard({ address }: { address?: `0x${string}` }) {
  const enabled = !!address && !!CONTRACT_ADDRESSES.reputation;
  const { data, isLoading, error } = useReadContract({
    abi: ReputationRegistryABI,
    address: CONTRACT_ADDRESSES.reputation || undefined,
    functionName: "getTrustScore",
    args: address ? [address] : undefined,
    query: { enabled },
  });
  if (!CONTRACT_ADDRESSES.reputation) {
    return (
      <StatCard
        icon={Gauge}
        label="Trust Score"
        value="—"
        sub="ReputationRegistry not deployed"
      />
    );
  }
  if (isLoading) return <StatCard icon={Gauge} label="Trust Score" value="…" />;
  if (error)
    return <StatCard icon={Gauge} label="Trust Score" value="!" sub="Read failed" tone="warning" />;
  const score = data ? Number((data as any)[0]) : 0;
  return (
    <StatCard
      icon={Gauge}
      label="Trust Score"
      value={score || "—"}
      sub={score ? "on-chain · ReputationRegistry" : "No analysis yet"}
    />
  );
}

function VerificationStatusCard({ address }: { address?: `0x${string}` }) {
  const enabled = !!address && !!CONTRACT_ADDRESSES.reputation;
  const { data, isLoading } = useReadContract({
    abi: ReputationRegistryABI,
    address: CONTRACT_ADDRESSES.reputation || undefined,
    functionName: "getTrustScore",
    args: address ? [address] : undefined,
    query: { enabled },
  });
  if (!CONTRACT_ADDRESSES.reputation) {
    return (
      <StatCard
        icon={ShieldCheck}
        label="Verification"
        value="Pending"
        sub="Awaiting contract deployment"
        tone="warning"
      />
    );
  }
  const verified = data && Number((data as any)[0]) > 0;
  return (
    <StatCard
      icon={ShieldCheck}
      label="Verification"
      value={isLoading ? "…" : verified ? "Verified" : "Unverified"}
      sub={verified ? "Score anchored on 0G Chain" : "Run AI Analysis to verify"}
      tone={verified ? "success" : "warning"}
    />
  );
}

function CredentialCountCard({ address }: { address?: `0x${string}` }) {
  const enabled = !!address && !!CONTRACT_ADDRESSES.credential;
  const { data, isLoading } = useReadContract({
    abi: CredentialRegistryABI,
    address: CONTRACT_ADDRESSES.credential || undefined,
    functionName: "credentialCount",
    args: address ? [address] : undefined,
    query: { enabled },
  });
  if (!CONTRACT_ADDRESSES.credential) {
    return (
      <StatCard
        icon={FileCheck2}
        label="Credentials"
        value="—"
        sub="CredentialRegistry not deployed"
      />
    );
  }
  return (
    <StatCard
      icon={FileCheck2}
      label="Credentials"
      value={isLoading ? "…" : String(data ?? 0)}
      sub="Anchored on 0G Chain"
      tone="accent"
    />
  );
}

function ActivityCard({ address }: { address?: `0x${string}` }) {
  const { data, isLoading } = useBalance({ address });
  return (
    <StatCard
      icon={Activity}
      label="Wallet Balance"
      value={isLoading ? "…" : data ? `${Number(data.formatted).toFixed(3)}` : "0"}
      sub={data ? `${data.symbol} on 0G Galileo` : "Live from RPC"}
    />
  );
}

function TrustTrend({ address }: { address?: `0x${string}` }) {
  // Pull historical ReputationUpdated events for this address from 0G Chain.
  const { data, isLoading, error } = useQuery({
    queryKey: ["trust-history", address, CONTRACT_ADDRESSES.reputation],
    enabled: !!address && !!CONTRACT_ADDRESSES.reputation,
    queryFn: async () => {
      const { ethers } = await import("ethers");
      const provider = new ethers.JsonRpcProvider(ZG_RPC_URL);
      const c = new ethers.Contract(
        CONTRACT_ADDRESSES.reputation,
        ReputationRegistryABI as any,
        provider,
      );
      const filter = c.filters.ReputationUpdated(address);
      const logs = await c.queryFilter(filter, -50_000);
      return logs.map((l: any) => ({
        block: l.blockNumber,
        score: Number(l.args?.[1] ?? 0),
        tx: l.transactionHash,
      }));
    },
  });

  return (
    <section className="glass-strong p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary/80">
            <Sparkles className="mr-1 inline h-3 w-3" /> Trust Score Trend
          </div>
          <h2 className="mt-1 font-display text-xl font-semibold">On-chain history</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          Source: ReputationRegistry events
        </div>
      </div>

      {!CONTRACT_ADDRESSES.reputation ? (
        <EmptyState
          icon={Database}
          title="Contract not configured"
          body="Set NEXT_PUBLIC_CONTRACT_REPUTATION to start reading on-chain history."
        />
      ) : isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted/40" />
      ) : error ? (
        <EmptyState
          icon={Activity}
          title="Couldn't read history"
          body={(error as Error).message}
        />
      ) : !data?.length ? (
        <EmptyState
          icon={Sparkles}
          title="No history yet"
          body="Run your first AI Analysis to populate the trend."
        />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 185)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.78 0.16 185)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.97 0.005 250 / 0.05)" vertical={false} />
              <XAxis dataKey="block" stroke="oklch(0.7 0.025 255)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.025 255)" fontSize={11} domain={[0, 1000]} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.19 0.025 260)",
                  border: "1px solid oklch(0.97 0.005 250 / 0.1)",
                  borderRadius: 8,
                  color: "white",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="oklch(0.78 0.16 185)"
                fill="url(#g)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-border p-10 text-center">
      <Icon className="h-6 w-6 text-muted-foreground" />
      <div className="mt-3 font-medium">{title}</div>
      <div className="mt-1 max-w-md text-sm text-muted-foreground">{body}</div>
    </div>
  );
}
