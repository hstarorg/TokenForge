import { useMemo } from "react";
import { AccountAddress, createObjectAddress } from "@aptos-labs/ts-sdk";
import type { MintPageVM } from "./MintPageVM";

interface Props {
  vm: MintPageVM;
  connected: boolean;
  deployer?: string;
  onSubmit: () => void;
}

export function MintForm({ vm, connected, deployer, onSubmit }: Props) {
  const { form, status } = vm.useSnapshot();
  const submitting = status === "signing" || status === "pending";
  const disabled = submitting || !connected;

  const previewAddress = useMemo(() => {
    if (!deployer || !form.symbol) return null;
    try {
      return createObjectAddress(AccountAddress.from(deployer), form.symbol).toString();
    } catch {
      return null;
    }
  }, [deployer, form.symbol]);

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
            vm.setField("decimals", Math.max(0, Math.min(9, Number(v) || 0)))
          }
          hint="Aptos FA mint amount is u64; supply × 10^decimals must fit."
        />
      </div>
      <Field
        label="Initial Supply"
        value={form.supply}
        onChange={(v) => vm.setField("supply", v)}
        hint="Supply is hard-capped at this value; no future mint possible."
      />
      <Field
        label="Icon URI"
        value={form.iconUri}
        onChange={(v) => vm.setField("iconUri", v)}
        hint="Optional. Image URL shown by wallets and explorers."
      />
      <Field
        label="Project URI"
        value={form.projectUri}
        onChange={(v) => vm.setField("projectUri", v)}
        hint="Optional. Project homepage URL."
      />

      {previewAddress && (
        <div className="preview-address">
          <span className="field-label">Target Metadata object (pre-deploy)</span>
          <code>{previewAddress}</code>
          <span className="field-hint">
            Derived from your wallet + symbol via Aptos named-object address scheme. Same symbol from the same wallet will collide.
          </span>
        </div>
      )}

      {!connected && (
        <p className="form-hint">Connect a wallet above to enable deploy.</p>
      )}
      <button type="submit" className="btn btn-primary" disabled={disabled}>
        {submitting ? "Publishing…" : "Deploy & Mint"}
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
