// All protocol-level interactions with the Jetton master contract.
//
// Scope: cell encoding (TEP-64 content, storage, message bodies), StateInit
// serialization, master address derivation, and a high-level deploy planner.
// This module is wallet-agnostic — it returns plain message descriptors that
// the caller (a TonConnect VM, a backend deployer, a test harness) can dispatch
// however it wants.
//
// Targets the Acton 1.0.0 built-in jetton template (regenerate the BOC via
// `pnpm ton:build`). Storage layout, opcodes, and message shapes here MUST
// match that template's ABI.

import {
  Address,
  type Builder,
  Cell,
  Dictionary,
  beginCell,
  contractAddress,
  storeStateInit,
  toNano,
} from "@ton/core";
import { sha256_sync } from "@ton/crypto";
import { JETTON_MASTER_CODE_BOC } from "../contracts/jetton-codes";

// === Opcodes (32-bit hashed names from contracts/build/abi/JettonMinter.json) ===
export const OP_MINT = 0x642b7d07;
export const OP_INTERNAL_TRANSFER = 0x178d4519;
export const OP_DROP_ADMIN = 0x7431f221;

// === TonConnect-compatible message descriptor ===
// Structural — does not import @tonconnect/ui-react types so this module stays
// independent of the wallet protocol. Caller casts as needed.
export interface DeployMessage {
  address: string;
  amount: string;
  stateInit?: string;
  payload?: string;
}

export interface JettonMetadataFields {
  name?: string;
  symbol?: string;
  decimals?: string;
  description?: string;
  image?: string;
  platform?: string;
}

export interface PrepareDeployArgs {
  admin: Address;
  recipient: Address;
  metadata: JettonMetadataFields;
  /** Already scaled by decimals (e.g. 1_000_000 * 10^9 for 1M tokens at 9 dp). */
  jettonAmount: bigint;
  testnet: boolean;
  /** Append a DropMinterAdmin message after the mint to renounce minting forever. */
  dropAdminAfterMint?: boolean;
  /** TON forwarded with the mint to fund wallet deploy + notification. Default 0.05 TON. */
  forwardTonAmount?: bigint;
  /** Value attached to the deploy message. Default 0.2 TON. */
  deployValue?: bigint;
  /** Value attached to the drop-admin message. Default 0.05 TON. */
  dropAdminValue?: bigint;
}

export interface DeployPlan {
  masterAddress: string;
  messages: DeployMessage[];
}

// === TEP-64 on-chain content ===
// keys = sha256(field-name) as 256-bit uint, values = ^Cell with 0x00 (snake)
// prefix byte + UTF-8 payload.

function metadataKey(name: string): bigint {
  return BigInt("0x" + sha256_sync(name).toString("hex"));
}

function snakeCell(value: string): Cell {
  return beginCell().storeUint(0, 8).storeStringTail(value).endCell();
}

export function buildJettonContent(fields: JettonMetadataFields): Cell {
  const dict = Dictionary.empty(
    Dictionary.Keys.BigUint(256),
    Dictionary.Values.Cell(),
  );
  for (const [k, v] of Object.entries(fields)) {
    if (!v) continue;
    dict.set(metadataKey(k), snakeCell(String(v)));
  }
  return beginCell().storeUint(0x00, 8).storeDict(dict).endCell();
}

// === MinterStorage layout ===
//   totalSupply       : coins
//   adminAddress      : addressOpt   (bare MsgAddress; null = addr_none$00)
//   nextAdminAddress  : addressOpt   (initial: null)
//   metadata          : cell (ref)
//
// Tolk's `address?` (typed as "addressOpt" in the ABI) is serialized as a bare
// MsgAddress with addr_none$00 for null — NOT a Maybe<address> wrapper. See
// .acton/tolk-stdlib/common.tolk: "address? will be serialized as '00' (none address)".
//
// Wallet code is bundled inside the master code at compile time, so storage
// does NOT carry it.

export function buildMinterStorage(args: { admin: Address; metadata: Cell }): Cell {
  return beginCell()
    .storeCoins(0)
    .storeAddress(args.admin)     // adminAddress
    .storeAddress(null)           // nextAdminAddress = addr_none
    .storeRef(args.metadata)
    .endCell();
}

// === Message bodies ===

export function buildMintBody(args: {
  to: Address;
  jettonAmount: bigint;
  forwardTonAmount: bigint;
  queryId?: bigint;
}): Cell {
  const queryId = args.queryId ?? BigInt(Date.now());
  const internalTransfer = beginCell()
    .storeUint(OP_INTERNAL_TRANSFER, 32)
    .storeUint(queryId, 64)
    .storeCoins(args.jettonAmount)
    .storeAddress(null)           // transferInitiator (addressOpt) = addr_none
    .storeAddress(null)           // sendExcessesTo  (addressOpt) = addr_none
    .storeCoins(0)                // forwardTonAmount on wallet side
    .storeBit(0)                  // forwardPayload: PayloadInline union prefix (1-bit, NOT an address)
    .endCell();

  return beginCell()
    .storeUint(OP_MINT, 32)
    .storeUint(queryId, 64)
    .storeAddress(args.to)
    .storeCoins(args.forwardTonAmount)
    .storeRef(internalTransfer)
    .endCell();
}

export function buildDropAdminBody(queryId?: bigint): Cell {
  return beginCell()
    .storeUint(OP_DROP_ADMIN, 32)
    .storeUint(queryId ?? BigInt(Date.now()), 64)
    .endCell();
}

// === StateInit + address derivation ===

function stateInitBoc(code: Cell, data: Cell): string {
  return beginCell()
    .store((b: Builder) => storeStateInit({ code, data })(b))
    .endCell()
    .toBoc()
    .toString("base64");
}

function loadMasterCode(): Cell {
  if (!JETTON_MASTER_CODE_BOC) {
    throw new Error(
      "Jetton bytecode not bundled. Run `pnpm ton:build` to populate web/src/chains/ton/contracts/jetton-codes.ts.",
    );
  }
  return Cell.fromBase64(JETTON_MASTER_CODE_BOC);
}

export function deriveMasterAddress(args: {
  admin: Address;
  metadata: Cell;
  testnet: boolean;
}): { address: string; code: Cell; data: Cell } {
  const code = loadMasterCode();
  const data = buildMinterStorage({ admin: args.admin, metadata: args.metadata });
  const master = contractAddress(0, { code, data });
  return {
    address: master.toString({
      urlSafe: true,
      bounceable: true,
      testOnly: args.testnet,
    }),
    code,
    data,
  };
}

// === High-level orchestrator ===

export function prepareJettonDeploy(args: PrepareDeployArgs): DeployPlan {
  const forwardTonAmount = args.forwardTonAmount ?? toNano("0.05");
  const deployValue = args.deployValue ?? toNano("0.2");
  const dropAdminValue = args.dropAdminValue ?? toNano("0.05");

  const content = buildJettonContent(args.metadata);
  const { address: masterAddress, code, data } = deriveMasterAddress({
    admin: args.admin,
    metadata: content,
    testnet: args.testnet,
  });

  const mintBody = buildMintBody({
    to: args.recipient,
    jettonAmount: args.jettonAmount,
    forwardTonAmount,
  });

  const messages: DeployMessage[] = [
    {
      address: masterAddress,
      amount: deployValue.toString(),
      stateInit: stateInitBoc(code, data),
      payload: mintBody.toBoc().toString("base64"),
    },
  ];

  if (args.dropAdminAfterMint) {
    messages.push({
      address: masterAddress,
      amount: dropAdminValue.toString(),
      payload: buildDropAdminBody().toBoc().toString("base64"),
    });
  }

  return { masterAddress, messages };
}
