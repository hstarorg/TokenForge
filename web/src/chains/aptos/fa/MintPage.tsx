import { useMemo } from "react";
import { useViewModel } from "bizify";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { MintPageVM } from "./MintPageVM";
import { MintForm } from "./MintForm";
import { ResultCard } from "./ResultCard";
import { APTOS_NETWORKS, networkNameToId } from "../networks";

export function MintPage() {
  const vm = useViewModel(MintPageVM);
  const { connected, account, network, signAndSubmitTransaction } = useWallet();
  const networkId = networkNameToId(network?.name);
  const deployerAddr = account?.address.toString();

  const aptos = useMemo(() => {
    const cfg = APTOS_NETWORKS.find((n) => n.id === networkId) ?? APTOS_NETWORKS[0];
    return new Aptos(new AptosConfig({ network: cfg.network }));
  }, [networkId]);

  const ready = connected && !!deployerAddr && !!networkId;

  return (
    <div className="mint-page">
      <h1>Mint Aptos Fungible Asset</h1>
      {connected && !networkId && (
        <p className="form-hint">
          Wallet reports an unknown chain ({String(network?.name)}). Switch to Aptos testnet or mainnet to continue.
        </p>
      )}
      <MintForm
        vm={vm}
        connected={ready}
        deployer={deployerAddr}
        onSubmit={() => {
          if (!deployerAddr || !networkId) return;
          void vm.submit({
            deployer: deployerAddr,
            network: networkId,
            aptos,
            signAndSubmit: signAndSubmitTransaction,
          });
        }}
      />
      <ResultCard vm={vm} />
    </div>
  );
}
