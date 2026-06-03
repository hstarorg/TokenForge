import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { ComingSoon } from "./pages/ComingSoon";
import { EvmLayout } from "./chains/evm/EvmLayout";
import { MintPage as EvmErc20MintPage } from "./chains/evm/erc20/MintPage";
import { SolanaLayout } from "./chains/solana/SolanaLayout";
import { MintPage as SolanaSplMintPage } from "./chains/solana/spl/MintPage";
import { TonLayout } from "./chains/ton/TonLayout";
import { MintPage as TonJettonMintPage } from "./chains/ton/jetton/MintPage";
import { StarknetLayout } from "./chains/starknet/StarknetLayout";
import { MintPage as StarknetErc20MintPage } from "./chains/starknet/erc20/MintPage";
import { SuiLayout } from "./chains/sui/SuiLayout";
import { MintPage as SuiCoinMintPage } from "./chains/sui/coin/MintPage";
import { AptosLayout } from "./chains/aptos/AptosLayout";
import { MintPage as AptosFaMintPage } from "./chains/aptos/fa/MintPage";
import { ZamaLayout } from "./chains/zama/ZamaLayout";
import { MintPage as ZamaConfidentialMintPage } from "./chains/zama/confidential/MintPage";

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
      { id: "coin", name: "Coin", status: "live" },
      { id: "nft",  name: "NFT",  status: "soon" },
    ],
  },
  {
    id: "aptos",
    name: "Aptos",
    assets: [
      { id: "coin", name: "Coin", status: "live" },
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
      { id: "erc20", name: "ERC-20", status: "live" },
      { id: "nft",   name: "NFT",    status: "soon" },
    ],
  },
  {
    id: "zama",
    name: "Zama",
    assets: [
      { id: "confidential", name: "Confidential (ERC-7984)", status: "live" },
    ],
  },
];

export function getChain(id: string): ChainSpec {
  const c = CHAINS.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown chain: ${id}`);
  return c;
}

// Strip trailing slash from BASE_URL — React Router basename expects "" or "/<name>".
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

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
        element: <SuiLayout />,
        children: [
          { index: true, element: <Navigate to="coin" replace /> },
          { path: "coin", element: <SuiCoinMintPage /> },
          { path: "nft",  element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/aptos",
        element: <AptosLayout />,
        children: [
          { index: true, element: <Navigate to="coin" replace /> },
          { path: "coin", element: <AptosFaMintPage /> },
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
        element: <StarknetLayout />,
        children: [
          { index: true, element: <Navigate to="erc20" replace /> },
          { path: "erc20", element: <StarknetErc20MintPage /> },
          { path: "nft",   element: <ComingSoon /> },
        ],
      },

      {
        path: "mint/zama",
        element: <ZamaLayout />,
        children: [
          { index: true, element: <Navigate to="confidential" replace /> },
          { path: "confidential", element: <ZamaConfidentialMintPage /> },
        ],
      },

      { path: "*", element: <ComingSoon /> },
    ],
  },
], { basename: ROUTER_BASENAME });
