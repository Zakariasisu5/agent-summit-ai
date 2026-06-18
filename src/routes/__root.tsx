import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Web3Provider } from "../components/Web3Provider";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md p-10 text-center">
        <p className="font-mono text-xs tracking-widest text-primary/80">ERROR 404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Off the trust graph</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for isn't on this chain.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Back to CredLayer
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md p-10 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something went sideways</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message ?? "Unknown error."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CredLayer — Trust Layer for AI Agents & Decentralized Identity" },
      {
        name: "description",
        content:
          "Build verifiable reputation, trust scores, and credentials powered by AI and 0G infrastructure.",
      },
      { name: "theme-color", content: "#0b1320" },
      { property: "og:title", content: "CredLayer — AI Trust & Reputation on 0G" },
      {
        property: "og:description",
        content:
          "Verifiable reputation for users and AI agents — scored by AI on 0G Compute, stored on 0G Storage, anchored on 0G Chain.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <Outlet />
        <Toaster richColors position="top-right" theme="dark" />
      </Web3Provider>
    </QueryClientProvider>
  );
}
