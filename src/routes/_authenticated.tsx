import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Activity,
  Bell,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ZG_CHAIN_ID } from "@/lib/zg-chain";
import logoIcon from "../assets/icon.webp";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reputation", label: "Reputation", icon: Gauge },
  { to: "/ai-analysis", label: "AI Analysis", icon: Sparkles },
  { to: "/credentials", label: "Credentials", icon: FileCheck2 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AuthenticatedLayout() {
  return (
    <ClientOnly fallback={<ShellSkeleton />}>
      <Gate />
    </ClientOnly>
  );
}

function Gate() {
  const { isConnected } = useAccount();
  if (!isConnected) return <ConnectGate />;
  return <Shell />;
}

function ConnectGate() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="glass-strong w-full max-w-md p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Connect your wallet
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          CredLayer anchors identity to your wallet on 0G Chain. Connect to continue.
        </p>
        <div className="mt-6 flex justify-center">
          <ConnectButton showBalance={false} />
        </div>
        <Link
          to="/"
          className="mt-6 inline-block text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

function Shell() {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-sidebar/60 px-4 py-6 backdrop-blur-xl md:flex">
      <Link to="/" className="flex items-center gap-2 px-2">
        <img 
          src={logoIcon} 
          alt="CredLayer" 
          className="h-7 w-7 rounded-md"
        />
        <span className="font-display text-base font-semibold">CredLayer</span>
      </Link>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV.map((n) => {
          const active = pathname === n.to || pathname.startsWith(n.to + "/");
          return (
            <Link
              key={n.to}
              to={n.to}
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              ].join(" ")}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="glass-panel p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground">0G Galileo</span>
        </div>
        <div className="mt-1">Chain ID {ZG_CHAIN_ID}</div>
      </div>
    </aside>
  );
}

function Topbar() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const wrongNetwork = chainId !== ZG_CHAIN_ID;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/60 px-4 py-3 backdrop-blur-xl md:px-8">
      {/* Mobile Menu */}
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex h-full flex-col">
              {/* Mobile Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <Link to="/" className="flex items-center gap-2">
                  <img 
                    src={logoIcon} 
                    alt="CredLayer" 
                    className="h-7 w-7 rounded-md"
                  />
                  <span className="font-display text-base font-semibold">CredLayer</span>
                </Link>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 space-y-1 p-4">
                {NAV.map((n) => {
                  const active = pathname === n.to || pathname.startsWith(n.to + "/");
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={[
                        "flex items-center gap-3 rounded-md px-3 py-3 text-sm transition",
                        active
                          ? "bg-sidebar-accent text-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      ].join(" ")}
                    >
                      <n.icon className="h-5 w-5" />
                      {n.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="border-t border-border p-4">
                <div className="glass-panel p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground">0G Galileo</span>
                  </div>
                  <div className="mt-1">Chain ID {ZG_CHAIN_ID}</div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/" className="md:hidden">
          <img 
            src={logoIcon} 
            alt="CredLayer" 
            className="h-7 w-7 rounded-md"
          />
        </Link>
      </div>

      {/* Desktop Network Badge */}
      <div className="hidden items-center gap-2 md:flex">
        {wrongNetwork ? (
          <Badge variant="destructive" className="gap-1 text-xs">
            <span className="hidden sm:inline">Wrong network</span>
            <span className="sm:hidden">Wrong net</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 px-1 text-xs sm:h-6 sm:px-2"
              disabled={isPending}
              onClick={() => switchChain({ chainId: ZG_CHAIN_ID })}
            >
              Switch
            </Button>
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 border-primary/40 text-xs text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="hidden sm:inline">0G Galileo</span>
            <span className="sm:hidden">0G</span>
          </Badge>
        )}
      </div>

      {/* Mobile Network Badge (smaller) */}
      <div className="flex items-center gap-2 md:hidden">
        {wrongNetwork ? (
          <Badge variant="destructive" className="text-[10px]">
            Wrong
            <Button
              size="sm"
              variant="ghost"
              className="ml-1 h-4 px-1 text-[10px]"
              disabled={isPending}
              onClick={() => switchChain({ chainId: ZG_CHAIN_ID })}
            >
              Switch
            </Button>
          </Badge>
        ) : (
          <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">
            <span className="inline-block h-1 w-1 rounded-full bg-primary" />
            <span className="ml-1">0G</span>
          </Badge>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="scale-90 sm:scale-100">
          <ConnectButton showBalance={false} accountStatus="address" chainStatus="none" />
        </div>
      </div>
    </header>
  );
}
