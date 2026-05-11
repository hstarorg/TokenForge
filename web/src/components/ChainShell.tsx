import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { ChainTabs } from "./ChainTabs";

interface Props {
  chainId: string;
  actions?: ReactNode;
}

export function ChainShell({ chainId, actions }: Props) {
  return (
    <>
      <div className="chain-bar">
        <ChainTabs chainId={chainId} />
        {actions && <div className="chain-actions">{actions}</div>}
      </div>
      <Outlet />
    </>
  );
}
