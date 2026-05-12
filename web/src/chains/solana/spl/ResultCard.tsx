import { copyText } from "@bizjs/biz-utils";
import { DEFAULT_SOLANA_NETWORK, solanaExplorer } from "../networks";
import type { MintPageVM } from "./MintPageVM";

interface Props {
  vm: MintPageVM;
}

export function ResultCard({ vm }: Props) {
  const { status, cluster: vmCluster, mintAddress, txSignature, errorMessage } =
    vm.useSnapshot();
  const cluster = vmCluster ?? DEFAULT_SOLANA_NETWORK.cluster;

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
        {txSignature && <TxLink sig={txSignature} cluster={cluster} />}
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
        <dt>Mint</dt>
        <dd>
          <a
            href={solanaExplorer(cluster, "address", mintAddress!)}
            target="_blank"
            rel="noreferrer"
          >
            {mintAddress}
          </a>
          <button
            type="button"
            className="btn-link"
            onClick={() => mintAddress && void copyText(mintAddress)}
          >
            Copy
          </button>
        </dd>
        <dt>Tx</dt>
        <dd>{txSignature && <TxLink sig={txSignature} cluster={cluster} />}</dd>
      </dl>
      <button type="button" className="btn" onClick={() => vm.reset()}>
        Mint another
      </button>
    </div>
  );
}

function TxLink({ sig, cluster }: { sig: string; cluster: "devnet" | "mainnet-beta" }) {
  const short = `${sig.slice(0, 10)}…${sig.slice(-8)}`;
  return (
    <a href={solanaExplorer(cluster, "tx", sig)} target="_blank" rel="noreferrer">
      {short}
    </a>
  );
}
