import {
  TonConnectButton,
  TonConnectUIProvider,
  useTonWallet,
} from "@tonconnect/ui-react";
import { ChainShell } from "../../components/ChainShell";
import { chainIdToNetwork, tonNetworkLabel } from "./networks";

// Tonkeeper resolves manifestUrl server-side via its bridge, so it can't reach
// localhost. In prod (GitHub Pages) the static manifest is served from
// BASE_URL; in dev, set VITE_TONCONNECT_MANIFEST_URL to a tunneled public URL
// if you need to test wallet connection locally.
const MANIFEST_URL =
  import.meta.env.VITE_TONCONNECT_MANIFEST_URL ||
  (typeof window !== "undefined"
    ? `${window.location.origin}${import.meta.env.BASE_URL}tonconnect-manifest.json`
    : `${import.meta.env.BASE_URL}tonconnect-manifest.json`);

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
