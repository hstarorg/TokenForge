import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Layout() {
  const { t } = useTranslation();
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          <img
            src="/favicon.svg"
            alt=""
            className="logo-mark"
            width={28}
            height={28}
          />
          <span>{t("header.logo")}</span>
        </Link>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
