// Sui Coin publish-time bytecode patching + transaction building.
//
// At publish time we take the pre-compiled `token.mv` (vendored in
// contracts/coin-template.ts) and replace the placeholder constants — name,
// symbol, decimals, description, initial_supply — with the user's values.
// Module / struct identifiers stay fixed (`token::TOKEN`) so every TokenForge
// coin shares the same module + struct names, making them filterable by
// indexers via `<any-package>::token::TokenForgeDeployed` event lookup.

import init, {
  update_constants,
} from "@mysten/move-bytecode-template";
import { bcs } from "@mysten/sui/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";
import {
  COIN_TEMPLATE_DEPENDENCIES,
  COIN_TEMPLATE_MODULE_HEX,
  COIN_TEMPLATE_PLACEHOLDERS,
} from "../contracts/coin-template";

const DESCRIPTION_MARKER = "Deployed via tokenforge.app";

export interface PrepareCoinPublishArgs {
  name: string;
  symbol: string;
  decimals: number;
  /** Already scaled by decimals (e.g. 1_000_000n * 10n ** 9n for 1M @ 9dp). */
  initialSupply: bigint;
  /** Free-form description; the platform marker is appended automatically. */
  description: string;
  /** Recipient of the initial Coin + TreasuryCap. Defaults to tx sender. */
  recipient: string;
}

// `init()` returns void in Node (sync WASM load) but Promise<InitOutput> in
// browser. tsc reads the Node types from the package; we always run in the
// browser at runtime, so await whatever it gives us.
let wasmInited = false;
async function ensureWasm(): Promise<void> {
  if (wasmInited) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (init() as any);
  wasmInited = true;
}

function bytesFromString(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/** Patch placeholders + build a publish transaction. */
export async function prepareCoinPublish(args: PrepareCoinPublishArgs): Promise<Transaction> {
  await ensureWasm();

  let bytecode: Uint8Array = fromHex(COIN_TEMPLATE_MODULE_HEX);

  // 1) decimals: u8 sentinel → user value
  bytecode = new Uint8Array(update_constants(
    bytecode,
    bcs.u8().serialize(args.decimals).toBytes(),
    bcs.u8().serialize(COIN_TEMPLATE_PLACEHOLDERS.decimals).toBytes(),
    "U8",
  ));

  // 2) symbol: vector<u8>
  bytecode = new Uint8Array(update_constants(
    bytecode,
    bcs.vector(bcs.u8()).serialize(bytesFromString(args.symbol)).toBytes(),
    bcs.vector(bcs.u8()).serialize(bytesFromString(COIN_TEMPLATE_PLACEHOLDERS.symbol)).toBytes(),
    "Vector(U8)",
  ));

  // 3) name: vector<u8>
  bytecode = new Uint8Array(update_constants(
    bytecode,
    bcs.vector(bcs.u8()).serialize(bytesFromString(args.name)).toBytes(),
    bcs.vector(bcs.u8()).serialize(bytesFromString(COIN_TEMPLATE_PLACEHOLDERS.name)).toBytes(),
    "Vector(U8)",
  ));

  // 4) description: vector<u8> (append marker so indexers can scan by string)
  const description = args.description
    ? `${args.description} — ${DESCRIPTION_MARKER}`
    : DESCRIPTION_MARKER;
  bytecode = new Uint8Array(update_constants(
    bytecode,
    bcs.vector(bcs.u8()).serialize(bytesFromString(description)).toBytes(),
    bcs.vector(bcs.u8()).serialize(bytesFromString(COIN_TEMPLATE_PLACEHOLDERS.description)).toBytes(),
    "Vector(U8)",
  ));

  // 5) initial_supply: u64
  bytecode = new Uint8Array(update_constants(
    bytecode,
    bcs.u64().serialize(args.initialSupply).toBytes(),
    bcs.u64().serialize(COIN_TEMPLATE_PLACEHOLDERS.initialSupply).toBytes(),
    "U64",
  ));

  const tx = new Transaction();
  const [upgradeCap] = tx.publish({
    modules: [Array.from(bytecode)],
    dependencies: [...COIN_TEMPLATE_DEPENDENCIES],
  });

  // The UpgradeCap controls future `package::publish_upgrade`. We hand it to
  // the user so they can upgrade their coin's bytecode later if they want.
  tx.transferObjects([upgradeCap], tx.pure.address(args.recipient));

  return tx;
}

/**
 * Pull the published package ID, TreasuryCap object ID, and initial coin
 * object ID from a publish transaction's `objectChanges`.
 */
export function extractPublishResult(objectChanges: ReadonlyArray<{
  type: string;
  objectType?: string;
  objectId?: string;
  packageId?: string;
}> | undefined | null): {
  packageId?: string;
  treasuryCapId?: string;
  initialCoinId?: string;
  metadataId?: string;
} {
  if (!objectChanges) return {};
  let packageId: string | undefined;
  let treasuryCapId: string | undefined;
  let initialCoinId: string | undefined;
  let metadataId: string | undefined;

  for (const change of objectChanges) {
    if (change.type === "published" && change.packageId) {
      packageId = change.packageId;
    } else if (change.type === "created" && change.objectType && change.objectId) {
      if (change.objectType.includes("::TreasuryCap<")) {
        treasuryCapId = change.objectId;
      } else if (change.objectType.includes("::CoinMetadata<")) {
        metadataId = change.objectId;
      } else if (change.objectType.includes("::Coin<")) {
        initialCoinId = change.objectId;
      }
    }
  }

  return { packageId, treasuryCapId, initialCoinId, metadataId };
}
