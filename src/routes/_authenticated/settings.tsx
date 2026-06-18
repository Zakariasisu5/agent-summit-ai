import { createFileRoute } from "@tanstack/react-router";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { CONTRACT_ADDRESSES } from "@/contracts";
import { ZG_CHAIN_ID, ZG_RPC_URL, ZG_STORAGE_INDEXER } from "@/lib/zg-chain";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · CredLayer" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Wallet, network, and contract configuration.
        </p>
      </header>

      <section className="glass-strong space-y-4 p-6">
        <h2 className="font-semibold">Wallet</h2>
        <Row label="Address"><code className="font-mono text-xs">{address}</code></Row>
        <Row label="Connector">{connector?.name ?? "—"}</Row>
        <Button variant="outline" onClick={() => disconnect()}>Disconnect</Button>
      </section>

      <section className="glass-panel space-y-4 p-6">
        <h2 className="font-semibold">0G Network</h2>
        <Row label="Chain ID">{ZG_CHAIN_ID}</Row>
        <Row label="RPC"><code className="break-all font-mono text-xs">{ZG_RPC_URL}</code></Row>
        <Row label="Storage Indexer">
          <code className="break-all font-mono text-xs">{ZG_STORAGE_INDEXER}</code>
        </Row>
      </section>

      <section className="glass-panel space-y-4 p-6">
        <h2 className="font-semibold">Contracts</h2>
        <Row label="IdentityRegistry">
          <code className="font-mono text-xs">{CONTRACT_ADDRESSES.identity || "(not deployed)"}</code>
        </Row>
        <Row label="ReputationRegistry">
          <code className="font-mono text-xs">{CONTRACT_ADDRESSES.reputation || "(not deployed)"}</code>
        </Row>
        <Row label="CredentialRegistry">
          <code className="font-mono text-xs">{CONTRACT_ADDRESSES.credential || "(not deployed)"}</code>
        </Row>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-start gap-3 text-sm">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}
