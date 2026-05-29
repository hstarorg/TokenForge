import { useViewModel } from "bizify";
import { useAccount, useNetwork, useProvider } from "@starknet-react/core";
import { MintPageVM } from "./MintPageVM";
import { MintForm } from "./MintForm";
import { ResultCard } from "./ResultCard";
import { chainIdToNetwork } from "../networks";

export function MintPage() {
  const vm = useViewModel(MintPageVM);
  const { account, address } = useAccount();
  const { provider } = useProvider();
  const { chain } = useNetwork();
  const network = chainIdToNetwork(chain?.id);
  const connected = !!account && !!address && !!network;

  return (
    <div className="mint-page">
      <h1>Mint Starknet ERC-20</h1>
      {address && !network && (
        <p className="form-hint">
          Wallet reports an unknown chain. Switch to Starknet Sepolia or Mainnet to continue.
        </p>
      )}
      <MintForm
        vm={vm}
        connected={connected}
        walletAddress={address}
        network={network}
        onSubmit={() => {
          if (!account || !network) return;
          void vm.submit({ account, provider, network });
        }}
      />
      <ResultCard vm={vm} />
    </div>
  );
}
