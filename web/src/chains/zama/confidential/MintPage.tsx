import { useViewModel } from "bizify";
import { useAccount } from "wagmi";
import { MintPageVM } from "./MintPageVM";
import { MintForm } from "./MintForm";
import { ResultCard } from "./ResultCard";

export function MintPage() {
  const vm = useViewModel(MintPageVM);
  const { address, chainId } = useAccount();
  const connected = !!address && !!chainId;

  return (
    <div className="mint-page">
      <h1>Mint Confidential Token (Zama)</h1>
      <p className="form-hint">
        Deploys an ERC-7984 confidential fungible token via Zama's fhEVM coprocessor
        on Ethereum Sepolia or Mainnet. Balances and transfers are end-to-end encrypted.
      </p>
      <MintForm
        vm={vm}
        connected={connected}
        onSubmit={() => {
          void vm.submit();
        }}
      />
      <ResultCard vm={vm} />
    </div>
  );
}
