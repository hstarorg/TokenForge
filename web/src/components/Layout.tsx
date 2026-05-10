import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Layout() {
  const { t } = useTranslation();
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">{t("header.logo")}</Link>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
