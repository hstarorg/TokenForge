import { mainnet, sepolia, type Chain } from "@starknet-react/chains";

export type StarknetNetworkId = "sepolia" | "mainnet";

export interface StarknetNetworkConfig {
  id: StarknetNetworkId;
  name: string;
  chain: Chain;
  rpcUrl: string;
  explorer: string;
}

const env = import.meta.env;

export const STARKNET_NETWORKS: StarknetNetworkConfig[] = [
  {
    id: "sepolia",
    name: "Sepolia",
    chain: sepolia,
    rpcUrl:
      env.VITE_STARKNET_SEPOLIA_RPC ||
      "https://starknet-sepolia.public.blastapi.io/rpc/v0_7",
    explorer: "https://sepolia.voyager.online",
  },
  {
    id: "mainnet",
    name: "Mainnet",
    chain: mainnet,
    rpcUrl:
      env.VITE_STARKNET_MAINNET_RPC ||
      "https://starknet-mainnet.public.blastapi.io/rpc/v0_7",
    explorer: "https://voyager.online",
  },
];

export const DEFAULT_STARKNET_NETWORK = STARKNET_NETWORKS[0];

export function starknetExplorer(
  network: StarknetNetworkId,
  kind: "tx" | "contract",
  value: string,
): string {
  const cfg = STARKNET_NETWORKS.find((n) => n.id === network) ?? DEFAULT_STARKNET_NETWORK;
  return kind === "tx"
    ? `${cfg.explorer}/tx/${value}`
    : `${cfg.explorer}/contract/${value}`;
}

// starknet-react/chains uses bigint chain IDs (felt252-encoded ASCII).
//   mainnet  = 0x534e5f4d41494e ("SN_MAIN")
//   sepolia  = 0x534e5f5345504f4c4941 ("SN_SEPOLIA")
export function chainIdToNetwork(chainId: bigint | string | undefined): StarknetNetworkId | null {
  if (chainId == null) return null;
  const v = typeof chainId === "bigint" ? chainId : BigInt(chainId);
  if (v === sepolia.id) return "sepolia";
  if (v === mainnet.id) return "mainnet";
  return null;
}
