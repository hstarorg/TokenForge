/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_SEPOLIA?: string;
  readonly VITE_RPC_MAINNET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
