import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import type { Chain } from "viem";
import { EVM_NETWORKS } from "./networks";

const chains = EVM_NETWORKS.map((n) => n.chain) as unknown as readonly [Chain, ...Chain[]];

const transports = Object.fromEntries(
  EVM_NETWORKS.map((n) => [n.chain.id, n.rpcUrl ? http(n.rpcUrl) : http()]),
);

const connectors = connectorsForWallets(
  [{ groupName: "Browser", wallets: [injectedWallet] }],
  { appName: "TokenForge", projectId: "" },
);

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports,
  ssr: false,
});
