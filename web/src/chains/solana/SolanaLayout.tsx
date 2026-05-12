import { useEffect, useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ChainShell } from "../../components/ChainShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_SOLANA_NETWORK,
  SOLANA_NETWORKS,
  type SolanaCluster,
} from "./networks";
import "@solana/wallet-adapter-react-ui/styles.css";

const STORAGE_KEY = "tokenforge.solana.cluster";

function readSavedCluster(): SolanaCluster {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "devnet" || v === "mainnet-beta") return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_SOLANA_NETWORK.cluster;
}

export function SolanaLayout() {
  const [cluster, setCluster] = useState<SolanaCluster>(readSavedCluster);
  const network = useMemo(
    () => SOLANA_NETWORKS.find((n) => n.cluster === cluster) ?? DEFAULT_SOLANA_NETWORK,
    [cluster],
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, cluster);
    } catch {
      /* ignore */
    }
  }, [cluster]);

  // 标准钱包（Phantom / Solflare / Backpack 等）通过 Wallet Standard 自动发现
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={network.endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ChainShell
            chainId="solana"
            actions={
              <>
                <Select
                  value={cluster}
                  onValueChange={(v) => setCluster(v as SolanaCluster)}
                >
                  <SelectTrigger size="sm" className="w-[150px]">
                    <SelectValue placeholder="Network" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOLANA_NETWORKS.map((n) => (
                      <SelectItem key={n.cluster} value={n.cluster}>
                        Solana · {n.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <WalletMultiButton />
              </>
            }
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
