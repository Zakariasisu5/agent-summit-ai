import { defineChain } from "viem";

/**
 * 0G Galileo testnet. Defaults match docs.0g.ai/developer-hub
 * and can be overridden via NEXT_PUBLIC_0G_RPC_URL / NEXT_PUBLIC_CHAIN_ID.
 */
const RPC_URL =
  import.meta.env.VITE_0G_RPC_URL ||
  import.meta.env.NEXT_PUBLIC_0G_RPC_URL ||
  "https://evmrpc-testnet.0g.ai";

const CHAIN_ID = Number(
  import.meta.env.VITE_CHAIN_ID ||
    import.meta.env.NEXT_PUBLIC_CHAIN_ID ||
    16602,
);

export const zgGalileo = defineChain({
  id: CHAIN_ID,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "0G ChainScan",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
});

export const ZG_CHAIN_ID = CHAIN_ID;
export const ZG_RPC_URL = RPC_URL;
export const ZG_STORAGE_INDEXER =
  import.meta.env.VITE_0G_STORAGE_INDEXER ||
  import.meta.env.NEXT_PUBLIC_0G_STORAGE_INDEXER ||
  "https://indexer-storage-testnet-turbo.0g.ai";
