import { Link } from "react-router-dom";
import { ROUTES, type MintRoute } from "../routes";

export function Home() {
  const byChain = ROUTES.reduce<Record<string, MintRoute[]>>((acc, r) => {
    (acc[r.chain] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <h1>多链铸币</h1>
      <p className="lead">选择链与资产类型开始铸造。</p>
      <div className="matrix">
        {Object.entries(byChain).map(([chain, items]) => (
          <section key={chain} className="chain">
            <h2>{chain}</h2>
            <ul>
              {items.map((r) => (
                <li key={r.path}>
                  <Link to={r.path}>{r.asset}</Link>
                  {r.status === "soon" && <span className="badge">Coming Soon</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
