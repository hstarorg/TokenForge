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

// Cartridge's public RPC reports spec 0.9.0, which matches starknet.js v10's
// supported channels (0.9 / 0.10). Blast deprecated their free tier and most
// alternatives still serve 0.7/0.8 — Cartridge is the working public default.
// Override with paid Alchemy / Nethermind / etc. via env if rate-limited.
export const STARKNET_NETWORKS: StarknetNetworkConfig[] = [
  {
    id: "sepolia",
    name: "Sepolia",
    chain: sepolia,
    rpcUrl:
      env.VITE_STARKNET_SEPOLIA_RPC ||
      "https://api.cartridge.gg/x/starknet/sepolia",
    explorer: "https://sepolia.voyager.online",
  },
  {
    id: "mainnet",
    name: "Mainnet",
    chain: mainnet,
    rpcUrl:
      env.VITE_STARKNET_MAINNET_RPC ||
      "https://api.cartridge.gg/x/starknet/mainnet",
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
