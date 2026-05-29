import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";

export type SuiNetworkId = "testnet" | "mainnet";

export interface SuiNetworkConfig {
  id: SuiNetworkId;
  name: string;
  rpcUrl: string;
  explorer: string;
}

const env = import.meta.env;

export const SUI_NETWORKS: SuiNetworkConfig[] = [
  {
    id: "testnet",
    name: "Testnet",
    rpcUrl: env.VITE_SUI_TESTNET_RPC || getJsonRpcFullnodeUrl("testnet"),
    explorer: "https://testnet.suivision.xyz",
  },
  {
    id: "mainnet",
    name: "Mainnet",
    rpcUrl: env.VITE_SUI_MAINNET_RPC || getJsonRpcFullnodeUrl("mainnet"),
    explorer: "https://suivision.xyz",
  },
];

export const DEFAULT_SUI_NETWORK = SUI_NETWORKS[0];

export function suiExplorer(
  network: SuiNetworkId,
  kind: "tx" | "package" | "object",
  value: string,
): string {
  const cfg = SUI_NETWORKS.find((n) => n.id === network) ?? DEFAULT_SUI_NETWORK;
  switch (kind) {
    case "tx": return `${cfg.explorer}/txblock/${value}`;
    case "package": return `${cfg.explorer}/package/${value}`;
    case "object": return `${cfg.explorer}/object/${value}`;
  }
}
