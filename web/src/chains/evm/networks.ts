import type { Chain } from "viem";
import { mainnet, sepolia } from "viem/chains";

export interface NetworkConfig {
  chain: Chain;
  rpcUrl?: string;
}

export const EVM_NETWORKS: NetworkConfig[] = [
  { chain: sepolia, rpcUrl: import.meta.env.VITE_RPC_SEPOLIA },
  { chain: mainnet, rpcUrl: import.meta.env.VITE_RPC_MAINNET },
];
