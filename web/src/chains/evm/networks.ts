import type { Chain } from "viem";
import { baseSepolia, mainnet, sepolia } from "viem/chains";

export interface NetworkConfig {
  chain: Chain;
  rpcUrl?: string;
}

// PublicNode free public RPCs — no key required, generous limits.
// Override per-chain via VITE_RPC_* env vars when you have a paid endpoint.
export const EVM_NETWORKS: NetworkConfig[] = [
  {
    chain: sepolia,
    rpcUrl: import.meta.env.VITE_RPC_SEPOLIA || "https://ethereum-sepolia-rpc.publicnode.com",
  },
  {
    chain: baseSepolia,
    rpcUrl: import.meta.env.VITE_RPC_BASE_SEPOLIA || "https://base-sepolia-rpc.publicnode.com",
  },
  {
    chain: mainnet,
    rpcUrl: import.meta.env.VITE_RPC_MAINNET || "https://ethereum-rpc.publicnode.com",
  },
];
