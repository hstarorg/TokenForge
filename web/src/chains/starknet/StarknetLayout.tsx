import { useMemo, useState } from "react";
import {
  StarknetConfig,
  jsonRpcProvider,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
} from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import { InjectedConnector } from "starknetkit/injected";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChainShell } from "../../components/ChainShell";
import { STARKNET_NETWORKS, chainIdToNetwork } from "./networks";

function StatusActions() {
  const { address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();

  const network = chainIdToNetwork(chain?.id);
  const networkLabel = network === "mainnet"
    ? "Starknet · Mainnet"
    : network === "sepolia"
      ? "Starknet · Sepolia"
      : null;

  const tone = networkLabel
    ? "bg-muted text-muted-foreground"
    : "bg-destructive/10 text-destructive";

  return (
    <>
      {address && (
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${tone}`}
        >
          {networkLabel ?? "Unknown chain"}
        </span>
      )}
      {address ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          title={address}
        >
          {`${address.slice(0, 6)}…${address.slice(-4)}`}
        </Button>
      ) : (
        <div className="flex gap-2">
          {connectors.map((c) => (
            <Button
              key={c.id}
              variant="outline"
              size="sm"
              onClick={() => connect({ connector: c })}
              disabled={status === "connecting"}
            >
              {c.name}
            </Button>
          ))}
        </div>
      )}
    </>
  );
}

export function StarknetLayout() {
  const [queryClient] = useState(() => new QueryClient());
  // ArgentX, Braavos, MyTonWallet etc. inject `window.starknet_*`. Wallet
  // Standard discovery is handled by starknetkit/injected.
  const connectors = useMemo(
    () => [
      new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
      new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
    ],
    [],
  );

  // Don't use starknet-react's `publicProvider()` — it hardcodes
  // specVersion="0.8.1", which starknet.js v10 rejects (v10 only ships RPC
  // channels for 0.9 and 0.10). Wire our own jsonRpcProvider pointing at the
  // Cartridge endpoint (spec 0.9.0) and tell the SDK to use the 0.9 channel.
  const provider = useMemo(
    () =>
      jsonRpcProvider({
        rpc: (chain) => {
          const cfg = STARKNET_NETWORKS.find((n) => n.chain.id === chain.id);
          if (!cfg) return null;
          return { nodeUrl: cfg.rpcUrl, specVersion: "0.9.0" };
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <StarknetConfig
        chains={[sepolia, mainnet]}
        provider={provider}
        connectors={connectors}
        autoConnect
      >
        <ChainShell chainId="starknet" actions={<StatusActions />} />
      </StarknetConfig>
    </QueryClientProvider>
  );
}
