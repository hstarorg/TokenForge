import type { MintPageVM } from "./MintPageVM";

interface Props {
  vm: MintPageVM;
  connected: boolean;
  onSubmit: () => void;
}

export function MintForm({ vm, connected, onSubmit }: Props) {
  const { form, status } = vm.useSnapshot();
  const submitting = status === "signing" || status === "pending";
  const disabled = submitting || !connected;

  return (
    <form
      className="mint-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Field label="Name" value={form.name} onChange={(v) => vm.setField("name", v)} />
      <Field label="Symbol" value={form.symbol} onChange={(v) => vm.setField("symbol", v)} />
      <Field
        label="Initial Supply (raw uint64)"
        value={form.initialSupply}
        onChange={(v) => vm.setField("initialSupply", v)}
        hint="ERC-7984 default decimals is 6, so 1,000,000 here = 1.000000 token. Max is 2^64-1."
      />
      <Field
        label="Recipient"
        value={form.recipient}
        onChange={(v) => vm.setField("recipient", v)}
        hint="Defaults to your connected wallet. Receives the entire initial supply."
      />
      <Field
        label="Contract URI"
        value={form.contractURI}
        onChange={(v) => vm.setField("contractURI", v)}
        hint="Optional. Off-chain JSON URL (like ERC-1155 contractURI) describing the token."
      />

      <p className="form-hint">
        Initial supply is trivially encrypted on-chain (publicly known by design); all
        subsequent transfers and balances are end-to-end FHE-encrypted via Zama.
      </p>

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
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
