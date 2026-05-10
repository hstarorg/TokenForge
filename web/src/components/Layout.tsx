import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">TokenForge</Link>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
