import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import type { Chain } from "viem";
import { ZAMA_NETWORKS } from "./networks";

// Separate wagmi config from the EVM one so the two layouts can each hold
// their own React Query + Wagmi state without bleeding into each other.

const chains = ZAMA_NETWORKS.map((n) => n.chain) as unknown as readonly [Chain, ...Chain[]];

const transports = Object.fromEntries(
  ZAMA_NETWORKS.map((n) => [n.chain.id, http(n.rpcUrl)]),
);

const connectors = connectorsForWallets(
  [{ groupName: "Browser", wallets: [injectedWallet] }],
  { appName: "TokenForge · Zama", projectId: "" },
);

export const zamaWagmiConfig = createConfig({
  chains,
  connectors,
  transports,
  ssr: false,
});
