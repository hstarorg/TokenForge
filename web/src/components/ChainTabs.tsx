import { NavLink } from "react-router-dom";
import type { Asset } from "../routes";

interface Props {
  chainId: string;
  assets: Asset[];
}

export function ChainTabs({ chainId, assets }: Props) {
  return (
    <nav className="asset-tabs">
      {assets.map((a) => (
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
