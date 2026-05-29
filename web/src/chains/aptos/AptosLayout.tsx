import { AptosWalletAdapterProvider, useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { Button } from "@/components/ui/button";
import { ChainShell } from "../../components/ChainShell";
import { networkNameToId } from "./networks";

function StatusActions() {
  const { connect, disconnect, connected, account, network, wallets } = useWallet();

  const networkId = networkNameToId(network?.name);
  const label = networkId
    ? `Aptos · ${networkId === "testnet" ? "Testnet" : "Mainnet"}`
    : network?.name
      ? "Unknown chain"
      : null;
  const tone = networkId
    ? "bg-muted text-muted-foreground"
    : "bg-destructive/10 text-destructive";

  return (
    <>
      {connected && label && (
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${tone}`}
        >
          {label}
        </span>
      )}
      {connected && account ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          title={account.address.toString()}
        >
          {`${account.address.toString().slice(0, 6)}…${account.address.toString().slice(-4)}`}
        </Button>
      ) : (
        <div className="flex gap-2">
          {wallets?.map((w) => (
            <Button
              key={w.name}
              variant="outline"
              size="sm"
              onClick={() => connect(w.name)}
            >
              {w.name}
            </Button>
          ))}
        </div>
      )}
    </>
  );
}

export function AptosLayout() {
  return (
    <AptosWalletAdapterProvider
      autoConnect
      dappConfig={{ network: Network.TESTNET }}
    >
      <ChainShell chainId="aptos" actions={<StatusActions />} />
    </AptosWalletAdapterProvider>
  );
}
