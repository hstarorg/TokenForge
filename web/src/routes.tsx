import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ChainShell } from "./components/ChainShell";
import { Home } from "./pages/Home";
import { ComingSoon } from "./pages/ComingSoon";
import { EvmLayout } from "./chains/evm/EvmLayout";
import { MintPage as EvmErc20MintPage } from "./chains/evm/erc20/MintPage";
import { SolanaLayout } from "./chains/solana/SolanaLayout";
import { MintPage as SolanaSplMintPage } from "./chains/solana/spl/MintPage";
import { TonLayout } from "./chains/ton/TonLayout";
import { MintPage as TonJettonMintPage } from "./chains/ton/jetton/MintPage";

export type Status = "live" | "soon";

export interface Asset {
  id: string;
  name: string;
  status: Status;
}

export interface ChainSpec {
  id: string;
  name: string;
  assets: Asset[];
}

export const CHAINS: ChainSpec[] = [
  {
    id: "evm",
    name: "EVM",
    assets: [
      { id: "erc20",   name: "ERC-20",   status: "live" },
      { id: "nft",     name: "ERC-721",  status: "soon" },
      { id: "erc1155", name: "ERC-1155", status: "soon" },
    ],
  },
  {
    id: "solana",
    name: "Solana",
    assets: [
      { id: "spl", name: "SPL Token", status: "live" },
      { id: "nft", name: "NFT",       status: "soon" },
    ],
  },
  {
    id: "sui",
    name: "Sui",
    assets: [
      { id: "coin", name: "Coin", status: "soon" },
      { id: "nft",  name: "NFT",  status: "soon" },
    ],
  },
  {
    id: "aptos",
    name: "Aptos",
    assets: [
      { id: "coin", name: "Coin", status: "soon" },
      { id: "nft",  name: "NFT",  status: "soon" },
    ],
  },
  {
    id: "ton",
    name: "TON",
    assets: [
      { id: "jetton", name: "Jetton", status: "live" },
      { id: "nft",    name: "NFT",    status: "soon" },
    ],
  },
  {
    id: "starknet",
    name: "Starknet",
    assets: [
      { id: "erc20", name: "ERC-20", status: "soon" },
      { id: "nft",   name: "NFT",    status: "soon" },
    ],
  },
];

export function getChain(id: string): ChainSpec {
  const c = CHAINS.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown chain: ${id}`);
  return c;
}

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
          { path: "erc20",   element: <EvmErc20MintPage /> },
          { path: "nft",     element: <ComingSoon /> },
          { path: "erc1155", element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/solana",
        element: <SolanaLayout />,
        children: [
          { index: true, element: <Navigate to="spl" replace /> },
          { path: "spl", element: <SolanaSplMintPage /> },
          { path: "nft", element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/sui",
        element: <ChainShell chainId="sui" />,
        children: [
          { index: true, element: <Navigate to="coin" replace /> },
          { path: "coin", element: <ComingSoon /> },
          { path: "nft",  element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/aptos",
        element: <ChainShell chainId="aptos" />,
        children: [
          { index: true, element: <Navigate to="coin" replace /> },
          { path: "coin", element: <ComingSoon /> },
          { path: "nft",  element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/ton",
        element: <TonLayout />,
        children: [
          { index: true, element: <Navigate to="jetton" replace /> },
          { path: "jetton", element: <TonJettonMintPage /> },
          { path: "nft",    element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/starknet",
        element: <ChainShell chainId="starknet" />,
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
