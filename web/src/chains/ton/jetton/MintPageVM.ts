import { ViewModelBase } from "bizify";
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
import type { SendTransactionRequest, TonConnectUI } from "@tonconnect/ui-react";
import { addToHistory } from "../../../lib/history";
import {
  JETTON_MASTER_CODE_BOC,
  JETTON_WALLET_CODE_BOC,
} from "../contracts/jetton-codes";
import { TON_NETWORKS, type TonNetwork } from "../networks";

// Targeted Jetton spec: standard TEP-74 master with 32-bit hashed opcodes
// (matches @ton-community/assets-sdk's audited JettonMinter). Storage layout:
//   storage#_ total_supply:Coins admin_address:MsgAddress
//             content:^Cell jetton_wallet_code:^Cell = Storage;
// Opcodes below MUST stay aligned with the FunC/Tolk source compiled into
// contracts/ton/. If we migrate a different reference implementation, update
// these constants together.
const OP_MINT = 0x642b7d07;
const OP_INTERNAL_TRANSFER = 0x178d4519;
const OP_CHANGE_ADMIN = 0x4840664f;

export type JettonStatus = "idle" | "signing" | "pending" | "success" | "error";

export interface FormFields {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  recipient: string;
  description: string;
  image: string;
  renounceMint: boolean;
}

interface MintData {
  form: FormFields;
  status: JettonStatus;
  network?: TonNetwork;
  masterAddress?: string;
  txBoc?: string;
  errorMessage?: string;
}

const INITIAL_FORM: FormFields = {
  name: "",
  symbol: "",
  decimals: 9,
  supply: "1000000",
  recipient: "",
  description: "",
  image: "",
  renounceMint: false,
};

// TEP-64 on-chain content: keys are sha256(field_name) as 256-bit uint, values
// are ^Cell with a 0x00 (snake) prefix byte and the UTF-8 payload.
function metadataKey(name: string): bigint {
  const hash = sha256_sync(name);
  return BigInt("0x" + hash.toString("hex"));
}

function snakeCell(value: string): Cell {
  return beginCell().storeUint(0, 8).storeStringTail(value).endCell();
}

function buildContent(fields: Record<string, string>): Cell {
  const dict = Dictionary.empty(
    Dictionary.Keys.BigUint(256),
    Dictionary.Values.Cell(),
  );
  for (const [k, v] of Object.entries(fields)) {
    if (!v) continue;
    dict.set(metadataKey(k), snakeCell(v));
  }
  return beginCell().storeUint(0x00, 8).storeDict(dict).endCell();
}

function buildJettonData(args: {
  admin: Address;
  content: Cell;
  walletCode: Cell;
}): Cell {
  return beginCell()
    .storeCoins(0)
    .storeAddress(args.admin)
    .storeRef(args.content)
    .storeRef(args.walletCode)
    .endCell();
}

function buildMintBody(args: {
  to: Address;
  jettonAmount: bigint;
  forwardTonAmount: bigint;
}): Cell {
  const queryId = BigInt(Date.now());
  const internalTransfer = beginCell()
    .storeUint(OP_INTERNAL_TRANSFER, 32)
    .storeUint(queryId, 64)
    .storeCoins(args.jettonAmount)
    .storeAddress(null) // from_address
    .storeAddress(null) // response_address
    .storeCoins(0) // forward_ton_amount
    .storeBit(0) // forward_payload: empty, inline
    .endCell();

  return beginCell()
    .storeUint(OP_MINT, 32)
    .storeUint(queryId, 64)
    .storeAddress(args.to)
    .storeCoins(args.forwardTonAmount)
    .storeRef(internalTransfer)
    .endCell();
}

function buildChangeAdminBody(newAdmin: Address | null): Cell {
  return beginCell()
    .storeUint(OP_CHANGE_ADMIN, 32)
    .storeUint(BigInt(Date.now()), 64)
    .storeAddress(newAdmin)
    .endCell();
}

function stateInitBoc(code: Cell, data: Cell): string {
  return beginCell()
    .store((b: Builder) => {
      storeStateInit({ code, data })(b);
    })
    .endCell()
    .toBoc()
    .toString("base64");
}

export class MintPageVM extends ViewModelBase<MintData> {
  protected $data(): MintData {
    return { form: { ...INITIAL_FORM }, status: "idle" };
  }

  setField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    this.data.form[key] = value;
  }

  reset() {
    this.data.status = "idle";
    this.data.masterAddress = undefined;
    this.data.txBoc = undefined;
    this.data.errorMessage = undefined;
  }

  async submit(opts: {
    tonConnect: TonConnectUI;
    sender: string;
    network: TonNetwork;
  }) {
    try {
      this.data.errorMessage = undefined;
      this.data.network = opts.network;
      this.data.status = "signing";

      if (!JETTON_MASTER_CODE_BOC || !JETTON_WALLET_CODE_BOC) {
        throw new Error(
          "Jetton bytecode not bundled yet. Build the Acton contracts under contracts/ton/ and run `pnpm sync-abi` to populate web/src/chains/ton/contracts/jetton-codes.ts.",
        );
      }

      const f = this.data.form;
      const admin = Address.parse(opts.sender);
      const recipient = f.recipient ? Address.parse(f.recipient) : admin;

      const jettonAmount = BigInt(f.supply) * 10n ** BigInt(f.decimals);

      const masterCode = Cell.fromBase64(JETTON_MASTER_CODE_BOC);
      const walletCode = Cell.fromBase64(JETTON_WALLET_CODE_BOC);

      const content = buildContent({
        name: f.name,
        symbol: f.symbol,
        decimals: String(f.decimals),
        description: f.description,
        image: f.image,
        platform: "tokenforge",
      });

      const data = buildJettonData({ admin, content, walletCode });
      const master = contractAddress(0, { code: masterCode, data });
      const masterAddress = master.toString({
        urlSafe: true,
        bounceable: true,
        testOnly: opts.network === "testnet",
      });

      const mintBody = buildMintBody({
        to: recipient,
        jettonAmount,
        forwardTonAmount: toNano("0.05"),
      });

      const messages: SendTransactionRequest["messages"] = [
        {
          address: masterAddress,
          amount: toNano("0.2").toString(),
          stateInit: stateInitBoc(masterCode, data),
          payload: mintBody.toBoc().toString("base64"),
        },
      ];

      if (f.renounceMint) {
        messages.push({
          address: masterAddress,
          amount: toNano("0.05").toString(),
          payload: buildChangeAdminBody(null).toBoc().toString("base64"),
        });
      }

      const chainId = TON_NETWORKS.find((n) => n.network === opts.network)?.chainId;

      const result = await opts.tonConnect.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360,
        network: chainId,
        messages,
      });

      // TonConnect returns the signed external-message BOC, not an on-chain tx
      // hash. We surface the master address (deterministic) for the explorer
      // link, and store a short prefix of the BOC as a reference id.
      this.data.txBoc = result.boc;
      this.data.masterAddress = masterAddress;
      this.data.status = "success";

      addToHistory({
        chain: "ton",
        chainId: 0,
        template: "jetton",
        address: masterAddress,
        name: f.name,
        symbol: f.symbol,
        decimals: f.decimals,
        txHash: result.boc.slice(0, 64),
        timestamp: Date.now(),
      });
    } catch (e) {
      this.data.errorMessage = e instanceof Error ? e.message : String(e);
      this.data.status = "error";
    }
  }
}
