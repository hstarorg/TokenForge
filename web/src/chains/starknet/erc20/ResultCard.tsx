import { copyText } from "@bizjs/biz-utils";
import { DEFAULT_STARKNET_NETWORK, starknetExplorer } from "../networks";
import type { MintPageVM } from "./MintPageVM";

interface Props {
  vm: MintPageVM;
}

export function ResultCard({ vm }: Props) {
  const { status, network: vmNetwork, contractAddress, txHash, errorMessage } =
    vm.useSnapshot();
  const network = vmNetwork ?? DEFAULT_STARKNET_NETWORK.id;

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
        {txHash && <TxLink hash={txHash} network={network} />}
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
        <dt>Contract</dt>
        <dd>
          <a
            href={starknetExplorer(network, "contract", contractAddress!)}
            target="_blank"
            rel="noreferrer"
          >
            {contractAddress}
          </a>
          <button
            type="button"
            className="btn-link"
            onClick={() => contractAddress && void copyText(contractAddress)}
          >
            Copy
          </button>
        </dd>
        <dt>Tx</dt>
        <dd>{txHash && <TxLink hash={txHash} network={network} />}</dd>
      </dl>
      <button type="button" className="btn" onClick={() => vm.reset()}>
        Mint another
      </button>
    </div>
  );
}

function TxLink({
  hash,
  network,
}: {
  hash: string;
  network: "sepolia" | "mainnet";
}) {
  const short = `${hash.slice(0, 10)}…${hash.slice(-8)}`;
  return (
    <a href={starknetExplorer(network, "tx", hash)} target="_blank" rel="noreferrer">
      {short}
    </a>
  );
}
