import { copyText } from "@bizjs/biz-utils";
import { DEFAULT_TON_NETWORK, tonExplorer } from "../networks";
import type { MintPageVM } from "./MintPageVM";

interface Props {
  vm: MintPageVM;
}

export function ResultCard({ vm }: Props) {
  const { status, network: vmNetwork, masterAddress, errorMessage } =
    vm.useSnapshot();
  const network = vmNetwork ?? DEFAULT_TON_NETWORK.network;

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
      <p className="form-hint">
        TonConnect doesn't return an in-chain transaction hash. Use the master
        address below to inspect the deployment on the explorer.
      </p>
      <dl className="result-fields">
        <dt>Master</dt>
        <dd>
          <a
            href={tonExplorer(network, "address", masterAddress!)}
            target="_blank"
            rel="noreferrer"
          >
            {masterAddress}
          </a>
          <button
            type="button"
            className="btn-link"
            onClick={() => masterAddress && void copyText(masterAddress)}
          >
            Copy
          </button>
        </dd>
      </dl>
      <button type="button" className="btn" onClick={() => vm.reset()}>
        Mint another
      </button>
    </div>
  );
}
