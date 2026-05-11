#!/usr/bin/env tsx
// Sync compiled contract artifacts (ABIs / IDLs) into web/src/chains/<chain>/{abi,idl}/.
//
// Usage:
//   pnpm sync-abi              sync all chains
//   pnpm sync-abi --chain evm  sync one chain

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const EVM_TEMPLATES = [
  "TokenForgeBasic",
  "TokenForgeBurnable",
  "TokenForgeOwnable",
  "TokenForgeGovernance",
] as const;

function syncEvm(): void {
  const srcDir = join(REPO_ROOT, "contracts/evm/out");
  const dstDir = join(REPO_ROOT, "web/src/chains/evm/abi");

  if (!existsSync(srcDir)) {
    console.warn(`[sync-abi] evm: ${relative(REPO_ROOT, srcDir)} missing — run 'forge build' first`);
    return;
  }

  mkdirSync(dstDir, { recursive: true });

  for (const name of EVM_TEMPLATES) {
    const artifactPath = join(srcDir, `${name}.sol`, `${name}.json`);
    if (!existsSync(artifactPath)) {
      console.warn(`[sync-abi] evm: ${name} artifact not found at ${relative(REPO_ROOT, artifactPath)}`);
      continue;
    }
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      abi: unknown;
      bytecode: { object: string } | string;
    };
    const bytecode =
      typeof artifact.bytecode === "string" ? artifact.bytecode : artifact.bytecode.object;
    const out = { abi: artifact.abi, bytecode };
    const dstPath = join(dstDir, `${name}.json`);
    writeFileSync(dstPath, JSON.stringify(out, null, 2) + "\n");
    console.log(`[sync-abi] evm: ${name} → ${relative(REPO_ROOT, dstPath)}`);
  }
}

const ALL_CHAINS = ["evm", "solana", "sui", "aptos", "ton", "starknet"] as const;
type Chain = (typeof ALL_CHAINS)[number];

const args = process.argv.slice(2);
const chainFlagIdx = args.indexOf("--chain");
const onlyChain = chainFlagIdx >= 0 ? (args[chainFlagIdx + 1] as Chain) : null;

const targets: Chain[] = onlyChain ? [onlyChain] : [...ALL_CHAINS];

for (const c of targets) {
  switch (c) {
    case "evm":
      syncEvm();
      break;
    default:
      console.log(`[sync-abi] ${c}: not implemented yet`);
  }
}
