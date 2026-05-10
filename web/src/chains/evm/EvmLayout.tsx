import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, ConnectButton } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "./client";
import { ChainShell } from "../../components/ChainShell";
import type { Asset } from "../../routes";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const EVM_ASSETS: Asset[] = [
  { id: "erc20",   name: "ERC-20",   status: "soon" },
  { id: "nft",     name: "ERC-721",  status: "soon" },
  { id: "erc1155", name: "ERC-1155", status: "soon" },
];

export function EvmLayout() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ChainShell
            chainId="evm"
            assets={EVM_ASSETS}
            actions={<ConnectButton showBalance={false} chainStatus="icon" />}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
