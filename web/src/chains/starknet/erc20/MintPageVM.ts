import { ViewModelBase } from "bizify";
import type { AccountInterface, ProviderInterface } from "starknet";
import { parseUnits } from "viem";
import { addToHistory } from "../../../lib/history";
import type { StarknetNetworkId } from "../networks";
import { prepareErc20Deploy } from "./erc20-contract";

export type Erc20Status = "idle" | "signing" | "pending" | "success" | "error";

export interface FormFields {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  recipient: string;
}

interface MintData {
  form: FormFields;
  status: Erc20Status;
  network?: StarknetNetworkId;
  contractAddress?: string;
  txHash?: string;
  errorMessage?: string;
}

const INITIAL_FORM: FormFields = {
  name: "",
  symbol: "",
  decimals: 18,
  supply: "1000000",
  recipient: "",
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
    this.data.contractAddress = undefined;
    this.data.txHash = undefined;
    this.data.errorMessage = undefined;
  }

  async submit(opts: {
    account: AccountInterface;
    provider: ProviderInterface;
    network: StarknetNetworkId;
  }) {
    try {
      this.data.errorMessage = undefined;
      this.data.network = opts.network;
      this.data.status = "signing";

      const f = this.data.form;
      const initialSupply = parseUnits(f.supply, f.decimals);

      const { contractAddress, call } = prepareErc20Deploy({
        network: opts.network,
        caller: opts.account.address,
        name: f.name,
        symbol: f.symbol,
        decimals: f.decimals,
        initialSupply,
        recipient: f.recipient || undefined,
      });

      const res = await opts.account.execute([call]);
      this.data.txHash = res.transaction_hash;
      this.data.contractAddress = contractAddress;
      this.data.status = "pending";

      await opts.provider.waitForTransaction(res.transaction_hash);
      this.data.status = "success";

      addToHistory({
        chain: "starknet",
        chainId: 0,
        template: "erc20",
        address: contractAddress,
        name: f.name,
        symbol: f.symbol,
        decimals: f.decimals,
        txHash: res.transaction_hash,
        timestamp: Date.now(),
      });
    } catch (e) {
      this.data.errorMessage = e instanceof Error ? e.message : String(e);
      this.data.status = "error";
    }
  }
}
