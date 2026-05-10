import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CHAINS } from "../routes";

export function Home() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("home.title")}</h1>
      <p className="lead">{t("home.lead")}</p>
      <div className="asset-grid">
        {CHAINS.map((c) => (
          <Link key={c.id} to={`/mint/${c.id}`} className="asset-card">
            <span className="asset-name">{c.name}</span>
            {c.status === "soon" && (
              <span className="badge">{t("home.comingSoon")}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
