import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, ConnectButton } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "./client";
import { ChainShell } from "../../components/ChainShell";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function EvmLayout() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ChainShell
            chainId="evm"
            actions={<ConnectButton showBalance={false} chainStatus="icon" />}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
