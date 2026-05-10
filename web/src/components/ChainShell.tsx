import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { ChainTabs } from "./ChainTabs";
import type { Asset } from "../routes";

interface Props {
  chainId: string;
  assets: Asset[];
  actions?: ReactNode;
}

export function ChainShell({ chainId, assets, actions }: Props) {
  return (
    <>
      <div className="chain-bar">
        <ChainTabs chainId={chainId} assets={assets} />
        {actions && <div className="chain-actions">{actions}</div>}
      </div>
      <Outlet />
    </>
  );
}
