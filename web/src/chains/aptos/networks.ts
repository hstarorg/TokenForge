import { Network } from "@aptos-labs/ts-sdk";

export type AptosNetworkId = "testnet" | "mainnet";

export interface AptosNetworkConfig {
  id: AptosNetworkId;
  name: string;
  network: Network;
  explorer: string;
}

export const APTOS_NETWORKS: AptosNetworkConfig[] = [
  {
    id: "testnet",
    name: "Testnet",
    network: Network.TESTNET,
    explorer: "https://explorer.aptoslabs.com",
  },
  {
    id: "mainnet",
    name: "Mainnet",
    network: Network.MAINNET,
    explorer: "https://explorer.aptoslabs.com",
  },
];

export const DEFAULT_APTOS_NETWORK = APTOS_NETWORKS[0];

export function aptosExplorer(
  network: AptosNetworkId,
  kind: "tx" | "account" | "object",
  value: string,
): string {
  const cfg = APTOS_NETWORKS.find((n) => n.id === network) ?? DEFAULT_APTOS_NETWORK;
  const suffix = `?network=${network}`;
  switch (kind) {
    case "tx": return `${cfg.explorer}/txn/${value}${suffix}`;
    case "account": return `${cfg.explorer}/account/${value}${suffix}`;
    case "object": return `${cfg.explorer}/object/${value}${suffix}`;
  }
}

export function networkNameToId(name: string | undefined): AptosNetworkId | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower === "testnet" || lower === "aptos testnet") return "testnet";
  if (lower === "mainnet" || lower === "aptos mainnet") return "mainnet";
  return null;
}
