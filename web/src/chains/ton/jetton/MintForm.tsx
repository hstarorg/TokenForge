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
      <Field
        label="Name"
        value={form.name}
        onChange={(v) => vm.setField("name", v)}
      />
      <div className="row">
        <Field
          label="Symbol"
          value={form.symbol}
          onChange={(v) => vm.setField("symbol", v)}
        />
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
      <Field
        label="Description"
        value={form.description}
        onChange={(v) => vm.setField("description", v)}
        hint="Optional. Stored on-chain in the Jetton content cell."
      />
      <Field
        label="Image URL"
        value={form.image}
        onChange={(v) => vm.setField("image", v)}
        hint="Optional. Stored on-chain; wallets display it as the Jetton icon."
      />

      <fieldset className="features">
        <legend>Features</legend>
        <Checkbox
          label="Renounce mint authority (immutable supply)"
          checked={form.renounceMint}
          onChange={(v) => vm.setField("renounceMint", v)}
        />
      </fieldset>

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

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
