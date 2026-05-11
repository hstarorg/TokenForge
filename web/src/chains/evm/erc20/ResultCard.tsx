import { copyText } from "@bizjs/biz-utils";
import { useChainId, useChains } from "wagmi";
import type { MintPageVM } from "./MintPageVM";

interface Props {
  vm: MintPageVM;
}

export function ResultCard({ vm }: Props) {
  const { status, txHash, contractAddress, errorMessage } = vm.useSnapshot();
  const chainId = useChainId();
  const chains = useChains();
  const explorer = chains.find((c) => c.id === chainId)?.blockExplorers?.default.url;

  if (status === "idle") return null;

  if (status === "signing") {
    return (
      <div className="result-card">
        <div className="result-title">Waiting for wallet signature…</div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="result-card">
        <div className="result-title">Transaction pending…</div>
        {txHash && <TxLink hash={txHash} explorer={explorer} />}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="result-card result-error">
        <div className="result-title">Failed</div>
        <pre className="result-error-msg">{errorMessage}</pre>
        <button type="button" className="btn" onClick={() => vm.reset()}>
          Reset
        </button>
      </div>
    );
  }

  return (
    <div className="result-card result-success">
      <div className="result-title">✓ Deployed</div>
      <dl className="result-fields">
        <dt>Address</dt>
        <dd>
          {explorer ? (
            <a href={`${explorer}/address/${contractAddress}`} target="_blank" rel="noreferrer">
              {contractAddress}
            </a>
          ) : (
            <span>{contractAddress}</span>
          )}
          <button
            type="button"
            className="btn-link"
            onClick={() => contractAddress && void copyText(contractAddress)}
          >
            Copy
          </button>
        </dd>
        <dt>Tx</dt>
        <dd>{txHash && <TxLink hash={txHash} explorer={explorer} />}</dd>
      </dl>
      <button type="button" className="btn" onClick={() => vm.reset()}>
        Mint another
      </button>
    </div>
  );
}

function TxLink({ hash, explorer }: { hash: string; explorer?: string }) {
  const short = `${hash.slice(0, 10)}…${hash.slice(-8)}`;
  if (!explorer) return <span>{short}</span>;
  return (
    <a href={`${explorer}/tx/${hash}`} target="_blank" rel="noreferrer">
      {short}
    </a>
  );
}
