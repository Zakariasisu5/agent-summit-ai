import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  darkTheme,
  type Theme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import { wagmiConfig } from "@/lib/wagmi";
import { ClientOnly } from "@tanstack/react-router";

const theme: Theme = darkTheme({
  accentColor: "oklch(0.78 0.16 185)",
  accentColorForeground: "#0b1320",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

export function Web3Provider({ children }: { children: ReactNode }) {
  // RainbowKit needs window/indexedDB; mount on client only.
  return (
    <ClientOnly fallback={<>{children}</>}>
      <Web3ProviderInner>{children}</Web3ProviderInner>
    </ClientOnly>
  );
}

function Web3ProviderInner({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>
        <RainbowKitProvider theme={theme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
