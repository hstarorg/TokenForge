#!/usr/bin/env tsx
// Declare the TokenForge ERC-20 Cairo class on a Starknet network.
//
// Prereq: contracts/starknet has been built via `pnpm starknet:build`
//         (which runs `scarb build` and produces sierra + casm under
//         contracts/starknet/target/dev/).
//
// Usage:
//   STARKNET_RPC=...  STARKNET_ACCOUNT=0x... STARKNET_PRIVATE_KEY=0x...  \
//     pnpm tsx scripts/starknet-declare.ts
//
// Required env vars:
//   STARKNET_RPC          — full node URL (e.g. https://starknet-sepolia.public.blastapi.io/rpc/v0_7)
//   STARKNET_ACCOUNT      — your ArgentX/Braavos account contract address (0x...)
//   STARKNET_PRIVATE_KEY  — the account's private key (keep secret)
//
// Optional:
//   STARKNET_NETWORK      — "sepolia" (default) | "mainnet" — labels output only.
//
// Output: prints class_hash, declare tx hash, and the suggested constant block
// to paste into web/src/chains/starknet/erc20/class-hashes.ts.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Account, RpcProvider, hash } from "starknet";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SIERRA_PATH = join(
  REPO_ROOT,
  "contracts/starknet/target/dev/tokenforge_erc20_TokenForgeERC20.contract_class.json",
);
const CASM_PATH = join(
  REPO_ROOT,
  "contracts/starknet/target/dev/tokenforge_erc20_TokenForgeERC20.compiled_contract_class.json",
);

function need(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`[declare] missing env var: ${name}`);
    process.exit(1);
  }
  return v;
}

async function main(): Promise<void> {
  if (!existsSync(SIERRA_PATH) || !existsSync(CASM_PATH)) {
    console.error(
      `[declare] build artifacts missing. Run \`pnpm starknet:build\` first.\n` +
        `  expected: ${SIERRA_PATH}\n` +
        `  expected: ${CASM_PATH}`,
    );
    process.exit(1);
  }

  const rpcUrl = need("STARKNET_RPC");
  const accountAddress = need("STARKNET_ACCOUNT");
  const privateKey = need("STARKNET_PRIVATE_KEY");
  const network = process.env.STARKNET_NETWORK ?? "sepolia";

  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const account = new Account(provider, accountAddress, privateKey);

  const sierra = JSON.parse(readFileSync(SIERRA_PATH, "utf8"));
  const casm = JSON.parse(readFileSync(CASM_PATH, "utf8"));

  // Compute class hash locally so we can short-circuit if already declared.
  const classHash = hash.computeContractClassHash(sierra);
  console.log(`[declare] computed class_hash: ${classHash}`);

  try {
    await provider.getClassByHash(classHash);
    console.log(`[declare] class already declared on ${network}, skipping submit`);
    printConstants(network, classHash, null);
    return;
  } catch {
    // not declared yet
  }

  console.log(`[declare] submitting declare tx on ${network}…`);
  const res = await account.declare({ contract: sierra, casm });
  console.log(`[declare] tx hash: ${res.transaction_hash}`);

  await provider.waitForTransaction(res.transaction_hash);
  console.log(`[declare] confirmed. class_hash=${res.class_hash}`);
  printConstants(network, res.class_hash, res.transaction_hash);
}

function printConstants(
  network: string,
  classHash: string,
  txHash: string | null,
): void {
  console.log("\n----- paste into web/src/chains/starknet/erc20/class-hashes.ts -----");
  const upper = network === "mainnet" ? "MAINNET" : "SEPOLIA";
  console.log(`export const TOKENFORGE_ERC20_CLASS_HASH_${upper} = "${classHash}";`);
  if (txHash) console.log(`// declared at: ${txHash}`);
  console.log("---------------------------------------------------------------------\n");
}

main().catch((e) => {
  console.error("[declare] failed:", e);
  process.exit(1);
});
