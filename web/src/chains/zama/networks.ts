import type { Chain } from "viem";
import { mainnet, sepolia } from "viem/chains";

// Zama Protocol's coprocessor is wired on regular Ethereum networks via the
// pre-deployed ACL / Coprocessor / KMSVerifier contracts (see
// @fhevm/solidity/config/ZamaConfig.sol). chainIds 1 + 11155111 are the
// supported ones today; chainId 31337 is reserved for local hardhat.
export interface ZamaNetworkConfig {
  chain: Chain;
  rpcUrl: string;
  explorer: string;
}

const env = import.meta.env;

export const ZAMA_NETWORKS: ZamaNetworkConfig[] = [
  {
    chain: sepolia,
    rpcUrl: env.VITE_RPC_SEPOLIA || "https://ethereum-sepolia-rpc.publicnode.com",
    explorer: "https://sepolia.etherscan.io",
  },
  {
    chain: mainnet,
    rpcUrl: env.VITE_RPC_MAINNET || "https://ethereum-rpc.publicnode.com",
    explorer: "https://etherscan.io",
  },
];

export const DEFAULT_ZAMA_NETWORK = ZAMA_NETWORKS[0];

export function zamaExplorer(
  chainId: number,
  kind: "tx" | "address",
  value: string,
): string {
  const cfg = ZAMA_NETWORKS.find((n) => n.chain.id === chainId) ?? DEFAULT_ZAMA_NETWORK;
  const path = kind === "tx" ? `/tx/${value}` : `/address/${value}`;
  return `${cfg.explorer}${path}`;
}
