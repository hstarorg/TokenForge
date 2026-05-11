import { useAccount } from "wagmi";
import type { MintPageVM } from "./MintPageVM";
import { getTemplate } from "./templates";

interface Props {
  vm: MintPageVM;
}

export function MintForm({ vm }: Props) {
  const { form, selectedTemplate, status } = vm.useSnapshot();
  const { isConnected } = useAccount();
  const tpl = getTemplate(selectedTemplate);
  const submitting = status === "signing" || status === "pending";
  const disabled = submitting || !isConnected;

  return (
    <form
      className="mint-form"
      onSubmit={(e) => {
        e.preventDefault();
        void vm.submit();
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
        value={form.initialSupply}
        onChange={(v) => vm.setField("initialSupply", v)}
      />
      <Field
        label="Recipient"
        value={form.recipient}
        onChange={(v) => vm.setField("recipient", v)}
        hint="Defaults to your connected wallet."
      />
      {tpl.extraFields.map((f) => {
        const key = f.key as "owner" | "maxSupply";
        return (
          <Field
            key={key}
            label={f.label}
            value={form[key]}
            onChange={(v) => vm.setField(key, v)}
            hint={f.hint}
          />
        );
      })}
      {!isConnected && (
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
