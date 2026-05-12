import { useViewModel } from "bizify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { MintPageVM } from "./MintPageVM";
import { MintForm } from "./MintForm";
import { ResultCard } from "./ResultCard";
import { clusterFromEndpoint } from "../networks";

export function MintPage() {
  const vm = useViewModel(MintPageVM);
  const { connection } = useConnection();
  const wallet = useWallet();
  const cluster = clusterFromEndpoint(connection.rpcEndpoint);

  return (
    <div className="mint-page">
      <h1>Mint SPL Token</h1>
      <MintForm
        vm={vm}
        connected={!!wallet.publicKey && !!wallet.signTransaction}
        onSubmit={() => {
          if (!wallet.publicKey || !wallet.signTransaction) return;
          void vm.submit({
            connection,
            payer: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            cluster,
          });
        }}
      />
      <ResultCard vm={vm} />
    </div>
  );
}
