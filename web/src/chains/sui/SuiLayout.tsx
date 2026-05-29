import { useMemo } from "react";
import {
  ConnectButton,
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
  useCurrentAccount,
  useSuiClientContext,
} from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChainShell } from "../../components/ChainShell";
import {
  DEFAULT_SUI_NETWORK,
  SUI_NETWORKS,
  type SuiNetworkId,
} from "./networks";

const STORAGE_KEY = "tokenforge.sui.network";

function readSaved(): SuiNetworkId {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "testnet" || v === "mainnet") return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_SUI_NETWORK.id;
}

function NetworkSelector() {
  const ctx = useSuiClientContext();
  const network = ctx.network as SuiNetworkId;

  return (
    <Select
      value={network}
      onValueChange={(v) => {
        ctx.selectNetwork(v);
        try {
          localStorage.setItem(STORAGE_KEY, v);
        } catch {
          /* ignore */
        }
      }}
    >
      <SelectTrigger size="sm" className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUI_NETWORKS.map((n) => (
          <SelectItem key={n.id} value={n.id}>
            Sui · {n.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function StatusActions() {
  useCurrentAccount(); // keep hook order stable
  return (
    <>
      <NetworkSelector />
      <ConnectButton />
    </>
  );
}

export function SuiLayout() {
  const networkConfig = useMemo(
    () =>
      createNetworkConfig({
        testnet: { url: SUI_NETWORKS[0].rpcUrl, network: "testnet" as const },
        mainnet: { url: SUI_NETWORKS[1].rpcUrl, network: "mainnet" as const },
      }).networkConfig,
    [],
  );

  return (
    <SuiClientProvider
      networks={networkConfig}
      defaultNetwork={readSaved()}
    >
      <WalletProvider autoConnect>
        <ChainShell chainId="sui" actions={<StatusActions />} />
      </WalletProvider>
    </SuiClientProvider>
  );
}
