#!/usr/bin/env tsx
// Deploy the TokenForge Aptos launcher Move package.
//
// Flow:
//   1. `aptos move compile --named-addresses tokenforge=<deployer>` produces
//      build artifacts under contracts/aptos/launcher/build/.
//   2. This script reads package-metadata.bcs + launcher.mv, submits a
//      publishPackageTransaction with the deployer's account, and prints the
//      resulting module address (== deployer address).
//   3. Paste the address into
//      web/src/chains/aptos/fa/launcher-address.ts.
//
// Usage:
//   APTOS_NETWORK=testnet APTOS_PRIVATE_KEY=0x... pnpm aptos:deploy
//
// Required env vars:
//   APTOS_NETWORK        "testnet" (default) | "mainnet"
//   APTOS_PRIVATE_KEY    Hex (with or without 0x prefix) for an Aptos account
//                        funded on the target network.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG_DIR = join(REPO_ROOT, "contracts/aptos/launcher");
const METADATA_PATH = join(PKG_DIR, "build/tokenforge/package-metadata.bcs");
const MODULE_PATH = join(PKG_DIR, "build/tokenforge/bytecode_modules/launcher.mv");

function need(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`[aptos-deploy] missing env var: ${name}`);
    process.exit(1);
  }
  return v;
}

async function main(): Promise<void> {
  const rawKey = need("APTOS_PRIVATE_KEY");
  const networkStr = (process.env.APTOS_NETWORK || "testnet").toLowerCase();
  const network = networkStr === "mainnet" ? Network.MAINNET : Network.TESTNET;

  const aptos = new Aptos(new AptosConfig({ network }));

  const privateKey = new Ed25519PrivateKey(
    PrivateKey.formatPrivateKey(rawKey, PrivateKeyVariants.Ed25519),
  );
  const account = Account.fromPrivateKey({ privateKey });
  const deployerAddr = account.accountAddress.toString();

  console.log(`[aptos-deploy] network: ${network}`);
  console.log(`[aptos-deploy] deployer: ${deployerAddr}`);

  // Recompile with the actual deployer address so named addresses resolve
  // correctly. (The on-chain code references tokenforge::launcher; that
  // resolves to <deployer>::launcher only when compiled with this address.)
  console.log(`[aptos-deploy] compiling with named-addresses tokenforge=${deployerAddr}`);
  execSync(
    `aptos move compile --named-addresses tokenforge=${deployerAddr}`,
    { cwd: PKG_DIR, stdio: "inherit" },
  );

  if (!existsSync(METADATA_PATH) || !existsSync(MODULE_PATH)) {
    console.error(
      `[aptos-deploy] expected build artifacts not found:\n  ${METADATA_PATH}\n  ${MODULE_PATH}`,
    );
    process.exit(1);
  }

  const metadataBytes = new Uint8Array(readFileSync(METADATA_PATH));
  const moduleBytes = new Uint8Array(readFileSync(MODULE_PATH));

  console.log(`[aptos-deploy] publishing package...`);
  const tx = await aptos.publishPackageTransaction({
    account: account.accountAddress,
    metadataBytes,
    moduleBytecode: [moduleBytes],
  });

  const submitted = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction: tx,
  });
  console.log(`[aptos-deploy] tx hash: ${submitted.hash}`);

  const result = await aptos.waitForTransaction({
    transactionHash: submitted.hash,
  });
  if (!result.success) {
    console.error(`[aptos-deploy] tx failed: ${result.vm_status}`);
    process.exit(1);
  }

  console.log(
    `\n[aptos-deploy] launcher published: ${deployerAddr}::launcher`,
  );
  console.log("\n----- paste into web/src/chains/aptos/fa/launcher-address.ts -----");
  const constName =
    network === Network.MAINNET ? "MAINNET" : "TESTNET";
  console.log(
    `export const TOKENFORGE_LAUNCHER_ADDRESS_${constName} = "${deployerAddr}";`,
  );
  console.log("---------------------------------------------------------------------\n");
}

main().catch((e) => {
  console.error("[aptos-deploy] failed:", e);
  process.exit(1);
});
