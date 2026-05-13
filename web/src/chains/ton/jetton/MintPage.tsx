import { useViewModel } from "bizify";
import {
  useTonAddress,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { MintPageVM } from "./MintPageVM";
import { MintForm } from "./MintForm";
import { ResultCard } from "./ResultCard";
import { chainIdToNetwork } from "../networks";

export function MintPage() {
  const vm = useViewModel(MintPageVM);
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress(true);
  const wallet = useTonWallet();
  const network = chainIdToNetwork(wallet?.account.chain);
  const connected = !!address && !!network;

  return (
    <div className="mint-page">
      <h1>Mint Jetton</h1>
      {wallet && !network && (
        <p className="form-hint">
          Wallet reports an unknown chain ({String(wallet.account.chain)}). Switch to TON mainnet or testnet to continue.
        </p>
      )}
      <MintForm
        vm={vm}
        connected={connected}
        walletAddress={address || undefined}
        testnet={network === "testnet"}
        onSubmit={() => {
          if (!address || !network) return;
          void vm.submit({
            tonConnect: tonConnectUI,
            sender: address,
            network,
          });
        }}
      />
      <ResultCard vm={vm} />
    </div>
  );
}
