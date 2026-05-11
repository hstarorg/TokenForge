import { useViewModel } from "bizify";
import { TemplatePicker } from "./TemplatePicker";
import { MintForm } from "./MintForm";
import { ResultCard } from "./ResultCard";
import { MintPageVM } from "./MintPageVM";

export function MintPage() {
  const vm = useViewModel(MintPageVM);
  return (
    <div className="mint-page">
      <h1>Mint ERC-20</h1>
      <TemplatePicker vm={vm} />
      <MintForm vm={vm} />
      <ResultCard vm={vm} />
    </div>
  );
}
