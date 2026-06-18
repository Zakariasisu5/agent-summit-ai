import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { zgGalileo } from "./zg-chain";

const WC_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  import.meta.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "credlayer-demo";

export const wagmiConfig = getDefaultConfig({
  appName: "CredLayer",
  projectId: WC_PROJECT_ID,
  chains: [zgGalileo],
  ssr: true,
});
