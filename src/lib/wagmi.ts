import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { zgGalileo } from "./zg-chain";

const WC_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  import.meta.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "";

// When no real WalletConnect projectId is configured we skip WalletConnect
// entirely. RainbowKit's `getDefaultConfig` always wires WalletConnect/Reown,
// which fetches a remote project config and logs a noisy 403 with a fake id.
export const wagmiConfig = WC_PROJECT_ID
  ? getDefaultConfig({
      appName: "CredLayer",
      projectId: WC_PROJECT_ID,
      chains: [zgGalileo],
      ssr: true,
    })
  : createConfig({
      chains: [zgGalileo],
      ssr: true,
      transports: { [zgGalileo.id]: http() },
      connectors: [
        injected(),
        coinbaseWallet({ appName: "CredLayer" }),
      ],
    });
