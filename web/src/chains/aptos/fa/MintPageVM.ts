import { ViewModelBase } from "bizify";
import type { Aptos } from "@aptos-labs/ts-sdk";
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { parseUnits } from "viem";
import { addToHistory } from "../../../lib/history";
import type { AptosNetworkId } from "../networks";
import { prepareFaDeploy } from "./aptos-fa-contract";

export type FaStatus = "idle" | "signing" | "pending" | "success" | "error";

export interface FormFields {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  iconUri: string;
  projectUri: string;
}

export type SignAndSubmitFn = (input: InputTransactionData) => Promise<{ hash: string }>;

interface MintData {
  form: FormFields;
  status: FaStatus;
  network?: AptosNetworkId;
  metadataAddress?: string;
  txHash?: string;
  errorMessage?: string;
}

const INITIAL_FORM: FormFields = {
  name: "",
  symbol: "",
  decimals: 6,
  supply: "1000000",
  iconUri: "",
  projectUri: "",
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
    this.data.metadataAddress = undefined;
    this.data.txHash = undefined;
    this.data.errorMessage = undefined;
  }

  async submit(opts: {
    deployer: string;
    network: AptosNetworkId;
    aptos: Aptos;
    signAndSubmit: SignAndSubmitFn;
  }) {
    try {
      this.data.errorMessage = undefined;
      this.data.network = opts.network;
      this.data.status = "signing";

      const f = this.data.form;
      const supply = parseUnits(f.supply, f.decimals);
      if (supply > 0xffffffffffffffffn) {
        throw new Error(
          "Supply * 10^decimals exceeds u64 max. Reduce supply or decimals.",
        );
      }

      const { metadataAddress, payload } = prepareFaDeploy({
        network: opts.network,
        deployer: opts.deployer,
        name: f.name,
        symbol: f.symbol,
        decimals: f.decimals,
        initialSupply: supply,
        iconUri: f.iconUri,
        projectUri: f.projectUri,
      });

      this.data.metadataAddress = metadataAddress;

      const res = await opts.signAndSubmit({ data: payload });
      this.data.txHash = res.hash;
      this.data.status = "pending";

      const txn = await opts.aptos.waitForTransaction({
        transactionHash: res.hash,
      });
      if (!("success" in txn) || !txn.success) {
        const reason =
          "vm_status" in txn && typeof txn.vm_status === "string"
            ? txn.vm_status
            : "unknown failure";
        throw new Error(`Transaction failed: ${reason}`);
      }

      this.data.status = "success";

      addToHistory({
        chain: "aptos",
        chainId: 0,
        template: "fa",
        address: metadataAddress,
        name: f.name,
        symbol: f.symbol,
        decimals: f.decimals,
        txHash: res.hash,
        timestamp: Date.now(),
      });
    } catch (e) {
      this.data.errorMessage = e instanceof Error ? e.message : String(e);
      this.data.status = "error";
    }
  }
}
