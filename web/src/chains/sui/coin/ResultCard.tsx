import { copyText } from "@bizjs/biz-utils";
import { DEFAULT_SUI_NETWORK, suiExplorer } from "../networks";
import type { MintPageVM } from "./MintPageVM";

interface Props {
  vm: MintPageVM;
}

export function ResultCard({ vm }: Props) {
  const {
    status,
    network: vmNetwork,
    digest,
    packageId,
    treasuryCapId,
    coinId,
    errorMessage,
  } = vm.useSnapshot();
  const network = vmNetwork ?? DEFAULT_SUI_NETWORK.id;

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
        {digest && <TxLink digest={digest} network={network} />}
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
      <div className="result-title">✓ Published</div>
      <dl className="result-fields">
        <dt>Package</dt>
        <dd>
          {packageId ? (
            <>
              <a
                href={suiExplorer(network, "package", packageId)}
                target="_blank"
                rel="noreferrer"
              >
                {packageId}
              </a>
              <button
                type="button"
                className="btn-link"
                onClick={() => void copyText(packageId)}
              >
                Copy
              </button>
            </>
          ) : (
            <span>—</span>
          )}
        </dd>
        <dt>TreasuryCap</dt>
        <dd>
          {treasuryCapId ? (
            <a
              href={suiExplorer(network, "object", treasuryCapId)}
              target="_blank"
              rel="noreferrer"
            >
              {treasuryCapId}
            </a>
          ) : (
            <span>—</span>
          )}
        </dd>
        <dt>Initial Coin</dt>
        <dd>
          {coinId ? (
            <a
              href={suiExplorer(network, "object", coinId)}
              target="_blank"
              rel="noreferrer"
            >
              {coinId}
            </a>
          ) : (
            <span>—</span>
          )}
        </dd>
        <dt>Tx</dt>
        <dd>{digest && <TxLink digest={digest} network={network} />}</dd>
      </dl>
      <button type="button" className="btn" onClick={() => vm.reset()}>
        Mint another
      </button>
    </div>
  );
}

function TxLink({
  digest,
  network,
}: {
  digest: string;
  network: "testnet" | "mainnet";
}) {
  const short = `${digest.slice(0, 10)}…${digest.slice(-8)}`;
  return (
    <a href={suiExplorer(network, "tx", digest)} target="_blank" rel="noreferrer">
      {short}
    </a>
  );
}
