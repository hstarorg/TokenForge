import { ViewModelBase } from "bizify";
import { Address } from "@ton/core";
import type { SendTransactionRequest, TonConnectUI } from "@tonconnect/ui-react";
import { addToHistory } from "../../../lib/history";
import { TON_NETWORKS, type TonNetwork } from "../networks";
import { prepareJettonDeploy } from "./jetton-contract";

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

      const f = this.data.form;
      const admin = Address.parse(opts.sender);
      const recipient = f.recipient ? Address.parse(f.recipient) : admin;
      const jettonAmount = BigInt(f.supply) * 10n ** BigInt(f.decimals);

      const { masterAddress, messages } = prepareJettonDeploy({
        admin,
        recipient,
        metadata: {
          name: f.name,
          symbol: f.symbol,
          decimals: String(f.decimals),
          description: f.description,
          image: f.image,
          platform: "tokenforge",
        },
        jettonAmount,
        testnet: opts.network === "testnet",
        dropAdminAfterMint: f.renounceMint,
      });

      const chainId = TON_NETWORKS.find((n) => n.network === opts.network)?.chainId;
      const result = await opts.tonConnect.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360,
        network: chainId,
        messages: messages as SendTransactionRequest["messages"],
      });

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
