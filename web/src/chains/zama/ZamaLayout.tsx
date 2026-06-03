import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, ConnectButton } from "@rainbow-me/rainbowkit";
import { zamaWagmiConfig } from "./client";
import { ChainShell } from "../../components/ChainShell";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function ZamaLayout() {
  return (
    <WagmiProvider config={zamaWagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ChainShell
            chainId="zama"
            actions={<ConnectButton showBalance={false} chainStatus="icon" />}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
