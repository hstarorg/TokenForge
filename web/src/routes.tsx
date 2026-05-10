import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ChainShell } from "./components/ChainShell";
import { Home } from "./pages/Home";
import { ComingSoon } from "./pages/ComingSoon";
import { EvmLayout } from "./chains/evm/EvmLayout";

export type Status = "live" | "soon";

export interface Asset {
  id: string;
  name: string;
  status: Status;
}

export interface ChainSpec {
  id: string;
  name: string;
  status: Status;
  assets: Asset[];
}

export const CHAINS: ChainSpec[] = [
  {
    id: "evm",
    name: "EVM",
    status: "soon",
    assets: [
      { id: "erc20",   name: "ERC-20",   status: "soon" },
      { id: "nft",     name: "ERC-721",  status: "soon" },
      { id: "erc1155", name: "ERC-1155", status: "soon" },
    ],
  },
  {
    id: "solana",
    name: "Solana",
    status: "soon",
    assets: [
      { id: "spl", name: "SPL Token", status: "soon" },
      { id: "nft", name: "NFT",       status: "soon" },
    ],
  },
  {
    id: "sui",
    name: "Sui",
    status: "soon",
    assets: [
      { id: "coin", name: "Coin", status: "soon" },
      { id: "nft",  name: "NFT",  status: "soon" },
    ],
  },
  {
    id: "aptos",
    name: "Aptos",
    status: "soon",
    assets: [
      { id: "coin", name: "Coin", status: "soon" },
      { id: "nft",  name: "NFT",  status: "soon" },
    ],
  },
  {
    id: "ton",
    name: "TON",
    status: "soon",
    assets: [
      { id: "jetton", name: "Jetton", status: "soon" },
      { id: "nft",    name: "NFT",    status: "soon" },
    ],
  },
  {
    id: "starknet",
    name: "Starknet",
    status: "soon",
    assets: [
      { id: "erc20", name: "ERC-20", status: "soon" },
      { id: "nft",   name: "NFT",    status: "soon" },
    ],
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      ...CHAINS.map((c) => ({
        path: `mint/${c.id}`,
        element: c.id === "evm" ? <EvmLayout /> : <ChainShell chainId={c.id} />,
        children: [
          { index: true, element: <Navigate to={c.assets[0].id} replace /> },
          ...c.assets.map((a) => ({
            path: a.id,
            element: <ComingSoon />,
          })),
        ],
      })),
      { path: "*", element: <ComingSoon /> },
    ],
  },
]);
