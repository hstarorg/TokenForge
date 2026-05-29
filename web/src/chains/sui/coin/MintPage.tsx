import { useViewModel } from "bizify";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientContext,
} from "@mysten/dapp-kit";
import { MintPageVM } from "./MintPageVM";
import { MintForm } from "./MintForm";
import { ResultCard } from "./ResultCard";
import type { SuiNetworkId } from "../networks";

export function MintPage() {
  const vm = useViewModel(MintPageVM);
  const account = useCurrentAccount();
  const client = useSuiClient();
  const ctx = useSuiClientContext();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const network = ctx.network as SuiNetworkId;
  const connected = !!account?.address;

  return (
    <div className="mint-page">
      <h1>Publish Sui Coin</h1>
      <MintForm
        vm={vm}
        connected={connected}
        onSubmit={() => {
          if (!account?.address) return;
          void vm.submit({
            sender: account.address,
            network,
            client,
            signAndExecute,
          });
        }}
      />
      <ResultCard vm={vm} />
    </div>
  );
}
