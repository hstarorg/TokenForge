export type TonNetwork = "testnet" | "mainnet";

export interface TonNetworkConfig {
  network: TonNetwork;
  name: string;
  endpoint: string;
  apiKey?: string;
  explorer: string;
  // TonConnect uses the masterchain id as a string: -239 mainnet, -3 testnet.
  chainId: string;
}

const env = import.meta.env;

export const TON_NETWORKS: TonNetworkConfig[] = [
  {
    network: "testnet",
    name: "Testnet",
    endpoint:
      env.VITE_TON_TESTNET_ENDPOINT ||
      "https://testnet.toncenter.com/api/v2/jsonRPC",
    apiKey: env.VITE_TON_TESTNET_API_KEY,
    explorer: "https://testnet.tonviewer.com",
    chainId: "-3",
  },
  {
    network: "mainnet",
    name: "Mainnet",
    endpoint:
      env.VITE_TON_MAINNET_ENDPOINT ||
      "https://toncenter.com/api/v2/jsonRPC",
    apiKey: env.VITE_TON_MAINNET_API_KEY,
    explorer: "https://tonviewer.com",
    chainId: "-239",
  },
];

export const DEFAULT_TON_NETWORK = TON_NETWORKS[0];

export function tonExplorer(
  network: TonNetwork,
  kind: "tx" | "address",
  value: string,
): string {
  const cfg = TON_NETWORKS.find((n) => n.network === network) ?? DEFAULT_TON_NETWORK;
  return kind === "tx"
    ? `${cfg.explorer}/transaction/${value}`
    : `${cfg.explorer}/${value}`;
}

// TonConnect's CHAIN id is the masterchain workchain id as a string.
export function chainIdToNetwork(chain: string | undefined): TonNetwork | null {
  if (chain === "-3") return "testnet";
  if (chain === "-239") return "mainnet";
  return null;
}

export function tonNetworkLabel(network: TonNetwork): string {
  return TON_NETWORKS.find((n) => n.network === network)?.name ?? network;
}
