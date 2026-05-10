import { NavLink } from "react-router-dom";
import { CHAINS } from "../routes";

interface Props {
  chainId: string;
}

export function ChainTabs({ chainId }: Props) {
  const chain = CHAINS.find((c) => c.id === chainId);
  if (!chain) return null;
  return (
    <nav className="asset-tabs">
      {chain.assets.map((a) => (
        <NavLink
          key={a.id}
          to={`/mint/${chainId}/${a.id}`}
          className={({ isActive }) => (isActive ? "tab active" : "tab")}
        >
          {a.name}
          {a.status === "soon" && <span className="tab-badge">soon</span>}
        </NavLink>
      ))}
    </nav>
  );
}
