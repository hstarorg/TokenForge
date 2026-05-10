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
}

export const CHAINS: ChainSpec[] = [
  { id: "evm",      name: "EVM",      status: "soon" },
  { id: "solana",   name: "Solana",   status: "soon" },
  { id: "sui",      name: "Sui",      status: "soon" },
  { id: "aptos",    name: "Aptos",    status: "soon" },
  { id: "ton",      name: "TON",      status: "soon" },
  { id: "starknet", name: "Starknet", status: "soon" },
];

const SOLANA_ASSETS: Asset[] = [
  { id: "spl", name: "SPL Token", status: "soon" },
  { id: "nft", name: "NFT",       status: "soon" },
];

const SUI_ASSETS: Asset[] = [
  { id: "coin", name: "Coin", status: "soon" },
  { id: "nft",  name: "NFT",  status: "soon" },
];

const APTOS_ASSETS: Asset[] = [
  { id: "coin", name: "Coin", status: "soon" },
  { id: "nft",  name: "NFT",  status: "soon" },
];

const TON_ASSETS: Asset[] = [
  { id: "jetton", name: "Jetton", status: "soon" },
  { id: "nft",    name: "NFT",    status: "soon" },
];

const STARKNET_ASSETS: Asset[] = [
  { id: "erc20", name: "ERC-20", status: "soon" },
  { id: "nft",   name: "NFT",    status: "soon" },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },

      {
        path: "mint/evm",
        element: <EvmLayout />,
        children: [
          { index: true, element: <Navigate to="erc20" replace /> },
          { path: "erc20",   element: <ComingSoon /> },
          { path: "nft",     element: <ComingSoon /> },
          { path: "erc1155", element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/solana",
        element: <ChainShell chainId="solana" assets={SOLANA_ASSETS} />,
        children: [
          { index: true, element: <Navigate to="spl" replace /> },
          { path: "spl", element: <ComingSoon /> },
          { path: "nft", element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/sui",
        element: <ChainShell chainId="sui" assets={SUI_ASSETS} />,
        children: [
          { index: true, element: <Navigate to="coin" replace /> },
          { path: "coin", element: <ComingSoon /> },
          { path: "nft",  element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/aptos",
        element: <ChainShell chainId="aptos" assets={APTOS_ASSETS} />,
        children: [
          { index: true, element: <Navigate to="coin" replace /> },
          { path: "coin", element: <ComingSoon /> },
          { path: "nft",  element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/ton",
        element: <ChainShell chainId="ton" assets={TON_ASSETS} />,
        children: [
          { index: true, element: <Navigate to="jetton" replace /> },
          { path: "jetton", element: <ComingSoon /> },
          { path: "nft",    element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/starknet",
        element: <ChainShell chainId="starknet" assets={STARKNET_ASSETS} />,
        children: [
          { index: true, element: <Navigate to="erc20" replace /> },
          { path: "erc20", element: <ComingSoon /> },
          { path: "nft",   element: <ComingSoon /> },
        ],
      },

      { path: "*", element: <ComingSoon /> },
    ],
  },
]);
