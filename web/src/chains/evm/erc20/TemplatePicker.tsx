import { TEMPLATES } from "./templates";
import type { MintPageVM } from "./MintPageVM";

interface Props {
  vm: MintPageVM;
}

export function TemplatePicker({ vm }: Props) {
  const { selectedTemplate } = vm.useSnapshot();
  return (
    <div className="template-grid">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => vm.selectTemplate(t.id)}
          className={`template-card${selectedTemplate === t.id ? " active" : ""}`}
        >
          <div className="template-name">{t.name}</div>
          <div className="template-desc">{t.description}</div>
          <ul className="template-features">
            {t.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </button>
      ))}
    </div>
  );
}
