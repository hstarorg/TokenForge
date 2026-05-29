import { useMemo } from "react";
import { parseUnits } from "viem";
import { prepareErc20Deploy } from "./erc20-contract";
import type { StarknetNetworkId } from "../networks";
import type { MintPageVM } from "./MintPageVM";

interface Props {
  vm: MintPageVM;
  connected: boolean;
  walletAddress?: string;
  network: StarknetNetworkId | null;
  onSubmit: () => void;
}

export function MintForm({ vm, connected, walletAddress, network, onSubmit }: Props) {
  const { form, status } = vm.useSnapshot();
  const submitting = status === "signing" || status === "pending";
  const disabled = submitting || !connected;

  const previewAddress = useMemo(() => {
    if (!walletAddress || !network) return null;
    try {
      const initialSupply = parseUnits(form.supply || "0", form.decimals);
      const { contractAddress } = prepareErc20Deploy({
        network,
        caller: walletAddress,
        name: form.name,
        symbol: form.symbol,
        decimals: form.decimals,
        initialSupply,
        recipient: form.recipient || undefined,
      });
      return contractAddress;
    } catch {
      return null;
    }
  }, [walletAddress, network, form.name, form.symbol, form.decimals, form.supply, form.recipient]);

  return (
    <form
      className="mint-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Field label="Name" value={form.name} onChange={(v) => vm.setField("name", v)} />
      <div className="row">
        <Field label="Symbol" value={form.symbol} onChange={(v) => vm.setField("symbol", v)} />
        <Field
          label="Decimals"
          type="number"
          value={String(form.decimals)}
          onChange={(v) =>
            vm.setField("decimals", Math.max(0, Math.min(18, Number(v) || 0)))
          }
        />
      </div>
      <Field
        label="Initial Supply"
        value={form.supply}
        onChange={(v) => vm.setField("supply", v)}
      />
      <Field
        label="Recipient"
        value={form.recipient}
        onChange={(v) => vm.setField("recipient", v)}
        hint="Defaults to your connected wallet."
      />

      {previewAddress && (
        <div className="preview-address">
          <span className="field-label">Target contract address (pre-deploy)</span>
          <code>{previewAddress}</code>
          <span className="field-hint">
            Deterministic from your wallet + form fields via UDC unique-address derivation.
          </span>
        </div>
      )}

      {!connected && (
        <p className="form-hint">Connect a wallet above to enable deploy.</p>
      )}
      <button type="submit" className="btn btn-primary" disabled={disabled}>
        {submitting ? "Deploying…" : "Deploy & Mint"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "number";
  hint?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
