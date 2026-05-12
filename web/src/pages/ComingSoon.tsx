import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function ComingSoon() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t("comingSoon.title")}</h1>
      <p>{t("comingSoon.body")} <code>{pathname}</code></p>
      <Link to="/">{t("comingSoon.back")}</Link>
    </div>
  );
}
