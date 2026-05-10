import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { ComingSoon } from "./pages/ComingSoon";

export type RouteStatus = "live" | "soon";

export interface MintRoute {
  path: string;
  chain: string;
  asset: string;
  status: RouteStatus;
}

export const ROUTES: MintRoute[] = [
  { path: "/mint/evm/erc20",      chain: "EVM",      asset: "ERC-20",    status: "soon" },
  { path: "/mint/evm/nft",        chain: "EVM",      asset: "ERC-721",   status: "soon" },
  { path: "/mint/evm/erc1155",    chain: "EVM",      asset: "ERC-1155",  status: "soon" },
  { path: "/mint/solana/spl",     chain: "Solana",   asset: "SPL Token", status: "soon" },
  { path: "/mint/solana/nft",     chain: "Solana",   asset: "NFT",       status: "soon" },
  { path: "/mint/sui/coin",       chain: "Sui",      asset: "Coin",      status: "soon" },
  { path: "/mint/sui/nft",        chain: "Sui",      asset: "NFT",       status: "soon" },
  { path: "/mint/aptos/coin",     chain: "Aptos",    asset: "Coin",      status: "soon" },
  { path: "/mint/aptos/nft",      chain: "Aptos",    asset: "NFT",       status: "soon" },
  { path: "/mint/ton/jetton",     chain: "TON",      asset: "Jetton",    status: "soon" },
  { path: "/mint/ton/nft",        chain: "TON",      asset: "NFT",       status: "soon" },
  { path: "/mint/starknet/erc20", chain: "Starknet", asset: "ERC-20",    status: "soon" },
  { path: "/mint/starknet/nft",   chain: "Starknet", asset: "NFT",       status: "soon" },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      ...ROUTES.map((r) => ({ path: r.path.slice(1), element: <ComingSoon /> })),
      { path: "*", element: <ComingSoon /> },
    ],
  },
]);
