import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount, useDisconnect } from "wagmi";
import { ExternalLink, Shield, Database, Cpu, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONTRACT_ADDRESSES } from "@/contracts";
import { ZG_CHAIN_ID, ZG_RPC_URL, ZG_STORAGE_INDEXER } from "@/lib/zg-chain";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · CredLayer" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();

  const explorerBase = `https://chainscan-galileo.0g.ai`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Wallet, network, and smart contract configuration on 0G Chain.
        </p>
      </header>

      {/* Wallet Section */}
      <section className="glass-strong space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Wallet</h2>
        </div>
        <Row label="Address">
          <div className="flex items-center gap-2">
            <code className="font-mono text-xs">{address}</code>
            <a
              href={`${explorerBase}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </Row>
        <Row label="Connector">
          <Badge variant="outline" className="text-xs">
            {connector?.name ?? "—"}
          </Badge>
        </Row>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => disconnect()}>
            Disconnect Wallet
          </Button>
        </div>
      </section>

      {/* Network Section */}
      <section className="glass-panel space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">0G Network</h2>
        </div>
        <Row label="Network">
          <Badge variant="default" className="text-xs">
            0G Galileo Testnet
          </Badge>
        </Row>
        <Row label="Chain ID">
          <code className="font-mono text-xs">{ZG_CHAIN_ID}</code>
        </Row>
        <Row label="RPC Endpoint">
          <code className="break-all font-mono text-xs">{ZG_RPC_URL}</code>
        </Row>
        <Row label="Storage Indexer">
          <code className="break-all font-mono text-xs">{ZG_STORAGE_INDEXER}</code>
        </Row>
        <Row label="Block Explorer">
          <a
            href={explorerBase}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {explorerBase}
            <ExternalLink className="h-3 w-3" />
          </a>
        </Row>
      </section>

      {/* Smart Contracts Section */}
      <section className="glass-panel space-y-4 p-6">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Smart Contracts</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Deployed on 0G Galileo Testnet. Click addresses to view on block explorer.
        </p>
        
        <Row label="IdentityRegistry">
          <a
            href={`${explorerBase}/address/${CONTRACT_ADDRESSES.identity}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
          >
            {CONTRACT_ADDRESSES.identity}
            <ExternalLink className="h-3 w-3" />
          </a>
        </Row>
        
        <Row label="ReputationRegistry">
          <a
            href={`${explorerBase}/address/${CONTRACT_ADDRESSES.reputation}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
          >
            {CONTRACT_ADDRESSES.reputation}
            <ExternalLink className="h-3 w-3" />
          </a>
        </Row>
        
        <Row label="CredentialRegistry">
          <a
            href={`${explorerBase}/address/${CONTRACT_ADDRESSES.credential}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
          >
            {CONTRACT_ADDRESSES.credential}
            <ExternalLink className="h-3 w-3" />
          </a>
        </Row>

        <div className="border-t border-border pt-4">
          <Row label="0G Serving Broker">
            <a
              href={`${explorerBase}/address/0xa48f01287233509FD694a22Bf840225062E67836`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              0xa48f01287233509FD694a22Bf840225062E67836
              <ExternalLink className="h-3 w-3" />
            </a>
          </Row>
          <p className="mt-2 text-xs text-muted-foreground">
            AI compute accounts are registered through the 0G Serving Broker contract.
          </p>
        </div>
      </section>

      {/* 0G Services Section */}
      <section className="glass-panel space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">0G Services</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          CredLayer leverages the complete 0G infrastructure stack.
        </p>
        
        <div className="space-y-3 pt-2">
          <ServiceCard
            icon="🧠"
            title="0G Compute"
            description="AI trust scoring powered by decentralized inference with cryptographic verification"
            status="Active"
          />
          <ServiceCard
            icon="💾"
            title="0G Storage"
            description="Verifiable credential storage with Merkle proofs and data availability guarantees"
            status="Active"
          />
          <ServiceCard
            icon="⛓️"
            title="0G Chain"
            description="Immutable reputation registry with on-chain anchoring and transparent history"
            status="Active"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="glass-panel space-y-4 p-6">
        <h2 className="font-semibold">About CredLayer</h2>
        <p className="text-sm text-muted-foreground">
          CredLayer is a decentralized trust layer for AI agents and users, built entirely on 0G infrastructure. 
          We provide verifiable reputation scoring, credential management, and trust verification for the decentralized future.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">Version 1.0.0</Badge>
          <Badge variant="outline" className="text-xs">0G Galileo Testnet</Badge>
          <Badge variant="outline" className="text-xs">Open Source</Badge>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" asChild>
            <a href="https://github.com/Zakariasisu5/agent-summit-ai" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              GitHub
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              Documentation
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[160px_1fr] sm:items-start sm:gap-3">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function ServiceCard({ 
  icon, 
  title, 
  description, 
  status 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  status: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{title}</h3>
            <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">
              {status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
