import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  Box,
  CircuitBoard,
  Database,
  FileCheck2,
  Fingerprint,
  Gauge,
  Globe2,
  Layers,
  Network,
  Plug,
  ScanFace,
  Server,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logoIcon from "../assets/icon.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CredLayer — Trust Layer for AI Agents & Decentralized Identity" },
      {
        name: "description",
        content:
          "Verifiable reputation for users and AI agents — scored by AI on 0G Compute, stored on 0G Storage, anchored on 0G Chain.",
      },
      { property: "og:title", content: "CredLayer — AI Trust on 0G" },
      {
        property: "og:description",
        content:
          "Build verifiable reputation, trust scores, and credentials powered by AI and 0G infrastructure.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <TrustEngine />
      <Infrastructure />
      <Faq />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between gap-4 px-4">
        <div className="glass-panel flex w-full items-center justify-between px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-base font-semibold tracking-tight">
              CredLayer
            </span>
            <Badge variant="outline" className="ml-2 border-primary/30 text-[10px] text-primary/90">
              0G Galileo
            </Badge>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#engine" className="hover:text-foreground">AI Engine</a>
            <a href="#infra" className="hover:text-foreground">0G Infra</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href="https://docs.0g.ai" target="_blank" rel="noreferrer">Docs</a>
            </Button>
            <Button asChild size="sm">
              <Link to="/dashboard">Launch App</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <img 
      src={logoIcon} 
      alt="CredLayer" 
      className="h-7 w-7 rounded-md"
    />
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-50" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-24 pt-16 md:grid-cols-2 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <Badge variant="outline" className="w-fit border-primary/30 text-primary/90">
            <Sparkles className="mr-1 h-3 w-3" /> Built on 0G — Storage · Compute · Chain
          </Badge>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            <span className="text-primary">Trust Layer</span>
            <br /> for AI Agents and
            <br /> Decentralized Identity
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Build verifiable reputation, trust scores, and credentials powered by AI and
            0G infrastructure. Every score is signed by an AI model on 0G Compute, the
            report lives on 0G Storage, and the result is anchored on 0G Chain.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">
                <Wallet className="mr-2 h-4 w-4" /> Launch App
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="https://docs.0g.ai" target="_blank" rel="noreferrer">
                View Documentation
              </a>
            </Button>
          </div>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-xs text-muted-foreground">
            <Stat label="Chain ID" value="16601" />
            <Stat label="Network" value="Galileo" />
            <Stat label="Stack" value="0G full" />
          </div>
        </motion.div>

        <TrustOrb />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-sm text-foreground">{value}</div>
    </div>
  );
}

function TrustOrb() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative mx-auto flex aspect-square w-full max-w-lg items-center justify-center"
    >
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative grid aspect-square w-[78%] place-items-center rounded-full glass-strong">
        <div className="absolute inset-6 rounded-full border border-primary/20" />
        <div className="absolute inset-12 rounded-full border border-primary/15" />
        <div className="absolute inset-20 rounded-full border border-primary/10 animate-pulse-ring" />
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Trust Score
          </div>
          <div className="font-display text-7xl font-semibold text-primary">847</div>
          <div className="mt-1 text-xs text-primary">Low Risk · 92% confidence</div>
        </div>
      </div>

      <FloatingCard
        className="absolute -left-4 top-10"
        icon={<Activity className="h-3.5 w-3.5" />}
        title="0G Compute"
        sub="Inference signed by provider"
      />
      <FloatingCard
        className="absolute -right-2 top-24"
        icon={<Database className="h-3.5 w-3.5" />}
        title="0G Storage"
        sub="root 0x9f3a…b41c"
      />
      <FloatingCard
        className="absolute bottom-6 left-6"
        icon={<Network className="h-3.5 w-3.5" />}
        title="0G Chain"
        sub="ReputationRegistry · tx confirmed"
      />
    </motion.div>
  );
}

function FloatingCard({
  className = "",
  icon,
  title,
  sub,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className={`glass-strong flex items-center gap-2 px-3 py-2 text-xs ${className}`}
    >
      <div className="grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-primary">
        {icon}
      </div>
      <div>
        <div className="font-medium text-foreground">{title}</div>
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      </div>
    </motion.div>
  );
}

function Features() {
  const items = [
    { icon: Gauge, title: "AI Trust Scoring", body: "On-chain activity scored 0–1000 by an AI model running on 0G Compute." },
    { icon: ScanFace, title: "Agent Reputation", body: "AI agents and humans share one address-anchored reputation graph." },
    { icon: FileCheck2, title: "Credential Verification", body: "Anchor any document hash, verify against 0G Storage byte-for-byte." },
    { icon: Database, title: "Decentralized Storage", body: "Reports persisted on 0G Storage with Merkle root proofs." },
    { icon: ShieldCheck, title: "On-chain Reputation", body: "Scores written to ReputationRegistry on 0G Chain — fully auditable." },
    { icon: Globe2, title: "Cross-Ecosystem Identity", body: "Single wallet identity portable across dApps, agents, and protocols." },
  ];
  return (
    <Section id="features" eyebrow="What it does" title="Reputation primitives for the agent era">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="glass-panel group p-6 transition hover:border-primary/30">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary/20">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Wallet, title: "Connect Wallet", body: "Your address becomes your identity anchor on 0G Chain." },
    { icon: Activity, title: "Build Reputation", body: "Activity, attestations and credentials feed your trust profile." },
    { icon: Sparkles, title: "Generate AI Analysis", body: "0G Compute runs the inference and returns a signed report." },
    { icon: Database, title: "Store on 0G", body: "Full report persisted on 0G Storage with a verifiable root hash." },
    { icon: Plug, title: "Verify Anywhere", body: "Any dApp or agent can read the score from ReputationRegistry." },
  ];
  return (
    <Section id="how" eyebrow="How it works" title="From wallet to verifiable trust in one flow">
      <div className="grid gap-4 md:grid-cols-5">
        {steps.map((s, i) => (
          <div key={s.title} className="glass-panel relative p-5">
            <div className="absolute right-3 top-3 font-mono text-xs text-muted-foreground">
              0{i + 1}
            </div>
            <s.icon className="h-5 w-5 text-primary" />
            <h4 className="mt-3 text-sm font-semibold">{s.title}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TrustEngine() {
  const cards = [
    { icon: ShieldCheck, title: "Risk Assessment", body: "Heuristics and AI signals flag exposure across known protocols." },
    { icon: Fingerprint, title: "Trust Analysis", body: "Multi-signal scoring with model rationale per dimension." },
    { icon: Layers, title: "Reputation Generation", body: "Composable scores agents and dApps can read on-chain." },
    { icon: Zap, title: "Fraud Detection", body: "Pattern matching surfaces drainers, sybils and bot rings." },
  ];
  return (
    <Section id="engine" eyebrow="AI Trust Engine" title="An inference pipeline you can audit">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-strong relative overflow-hidden p-8">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Live model output
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Metric label="Trust" value="847" tone="primary" />
              <Metric label="Risk" value="Low" tone="success" />
              <Metric label="Confidence" value="92%" tone="accent" />
            </div>
            <div className="mt-6 space-y-2">
              {[
                { l: "Wallet age & cadence", v: 88 },
                { l: "Counterparty quality", v: 76 },
                { l: "Sybil signal (low = good)", v: 12 },
                { l: "Credential coverage", v: 64 },
              ].map((r) => (
                <div key={r.l}>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{r.l}</span>
                    <span className="font-mono text-foreground">{r.v}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${r.v}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground">
              <span className="text-primary">0G Compute job</span> · provider 0x7b…91 ·
              model llama-3.1-8b-instruct · signed response verified.
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass-panel p-5">
              <Icon className="h-5 w-5 text-primary" />
              <h4 className="mt-3 font-semibold">{title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "accent" | "success";
}) {
  return (
    <div className="glass-panel p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-semibold text-primary">{value}</div>
    </div>
  );
}

function Infrastructure() {
  const pillars = [
    {
      icon: Network,
      title: "0G Chain",
      sub: "EVM L1, Galileo testnet",
      body: "ReputationRegistry, IdentityRegistry and CredentialRegistry anchor every score and credential.",
    },
    {
      icon: Database,
      title: "0G Storage",
      sub: "Merkle-rooted blobs",
      body: "Full AI reports and credential payloads stored with verifiable root hashes.",
    },
    {
      icon: Server,
      title: "0G Compute",
      sub: "Decentralized inference",
      body: "Model providers run the inference; responses are signed and verifiable by the broker.",
    },
  ];
  return (
    <Section id="infra" eyebrow="0G Infrastructure" title="One pipeline, three 0G primitives">
      <div className="grid gap-4 md:grid-cols-3">
        {pillars.map(({ icon: Icon, title, sub, body }) => (
          <div key={title} className="glass-panel p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{title}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
      <div className="glass-strong mt-6 grid items-center gap-4 p-6 text-sm md:grid-cols-5">
        <Flow icon={Wallet} label="Wallet activity" />
        <Arrow />
        <Flow icon={CircuitBoard} label="0G Compute · inference" />
        <Arrow />
        <Flow icon={Box} label="0G Chain · anchor + tx" />
      </div>
    </Section>
  );
}

function Flow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-card text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
function Arrow() {
  return (
    <div className="hidden h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
  );
}

function Faq() {
  const items = [
    {
      q: "Is the trust score real or simulated?",
      a: "Real. Every score is produced by a 0G Compute inference job, persisted to 0G Storage, and written on-chain via the ReputationRegistry contract on 0G Galileo. There is no mock data in the live path.",
    },
    {
      q: "Do I need an account?",
      a: "No. Your wallet address is your identity. Connect with any EVM wallet — MetaMask, Rabby, Coinbase, or any WalletConnect-compatible app.",
    },
    {
      q: "What does it cost?",
      a: "Storage uploads and Compute inference are paid actions on 0G. The CredLayer server signer covers them in the demo; in production each user signs.",
    },
    {
      q: "Where can I verify a report?",
      a: "Every report exposes its 0G Storage root hash and the on-chain tx hash. Anyone can re-download the report and recompute the Merkle root.",
    },
  ];
  return (
    <Section id="faq" eyebrow="FAQ" title="Questions, answered">
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="glass-panel divide-y divide-border px-2">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`i-${i}`} className="border-b-0">
              <AccordionTrigger className="px-4 text-left">{it.q}</AccordionTrigger>
              <AccordionContent className="px-4 text-sm text-muted-foreground">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-10 pt-6">
      <div className="glass-panel flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-sm font-semibold">CredLayer</span>
          <span className="text-xs text-muted-foreground">· built for the 0G Zero Cup</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <a href="https://docs.0g.ai" target="_blank" rel="noreferrer" className="hover:text-foreground">0G Docs</a>
          <a href="https://chainscan-galileo.0g.ai" target="_blank" rel="noreferrer" className="hover:text-foreground">Explorer</a>
          <Link to="/dashboard" className="hover:text-foreground">Launch App</Link>
        </div>
      </div>
    </footer>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-10 max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-primary/80">{eyebrow}</div>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
