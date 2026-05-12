export type SolanaCluster = "devnet" | "mainnet-beta";

export interface SolanaNetwork {
  cluster: SolanaCluster;
  name: string;
  endpoint: string;
}

export const SOLANA_NETWORKS: SolanaNetwork[] = [
  {
    cluster: "devnet",
    name: "Devnet",
    endpoint: import.meta.env.VITE_RPC_SOLANA_DEVNET || "https://api.devnet.solana.com",
  },
  {
    cluster: "mainnet-beta",
    name: "Mainnet",
    endpoint: import.meta.env.VITE_RPC_SOLANA_MAINNET || "https://api.mainnet-beta.solana.com",
  },
];

export const DEFAULT_SOLANA_NETWORK = SOLANA_NETWORKS[0];

export function solanaExplorer(
  cluster: SolanaCluster,
  kind: "tx" | "address",
  value: string,
): string {
  const path = kind === "tx" ? `/tx/${value}` : `/address/${value}`;
  const suffix = cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com${path}${suffix}`;
}

export function clusterFromEndpoint(endpoint: string): SolanaCluster {
  const match = SOLANA_NETWORKS.find((n) => n.endpoint === endpoint);
  return match?.cluster ?? DEFAULT_SOLANA_NETWORK.cluster;
}
