import { useMemo } from "react";
import {
  StarknetConfig,
  publicProvider,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
} from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import { InjectedConnector } from "starknetkit/injected";
import { Button } from "@/components/ui/button";
import { ChainShell } from "../../components/ChainShell";
import { chainIdToNetwork } from "./networks";

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
  // ArgentX, Braavos, MyTonWallet etc. inject `window.starknet_*`. Wallet
  // Standard discovery is handled by starknetkit/injected.
  const connectors = useMemo(
    () => [
      new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
      new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
    ],
    [],
  );

  return (
    <StarknetConfig
      chains={[sepolia, mainnet]}
      provider={publicProvider()}
      connectors={connectors}
      autoConnect
    >
      <ChainShell chainId="starknet" actions={<StatusActions />} />
    </StarknetConfig>
  );
}
