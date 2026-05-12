import {
  TonConnectButton,
  TonConnectUIProvider,
  useTonWallet,
} from "@tonconnect/ui-react";
import { ChainShell } from "../../components/ChainShell";
import { chainIdToNetwork, tonNetworkLabel } from "./networks";

const MANIFEST_URL =
  import.meta.env.VITE_TONCONNECT_MANIFEST_URL ||
  (typeof window !== "undefined"
    ? `${window.location.origin}/tonconnect-manifest.json`
    : "/tonconnect-manifest.json");

function NetworkBadge() {
  const wallet = useTonWallet();
  if (!wallet) return null;
  const network = chainIdToNetwork(wallet.account.chain);
  const label = network ? `TON · ${tonNetworkLabel(network)}` : "Unknown chain";
  const tone = network
    ? "bg-muted text-muted-foreground"
    : "bg-destructive/10 text-destructive";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}

export function TonLayout() {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      <ChainShell
        chainId="ton"
        actions={
          <>
            <NetworkBadge />
            <TonConnectButton />
          </>
        }
      />
    </TonConnectUIProvider>
  );
}
