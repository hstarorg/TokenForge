import { ViewModelBase } from "bizify";
import type { SuiJsonRpcClient, SuiTransactionBlockResponse } from "@mysten/sui/jsonRpc";
import type { Transaction } from "@mysten/sui/transactions";
import { parseUnits } from "viem";
import { addToHistory } from "../../../lib/history";
import type { SuiNetworkId } from "../networks";
import { extractPublishResult, prepareCoinPublish } from "./sui-coin-contract";

export type CoinStatus = "idle" | "signing" | "pending" | "success" | "error";

export interface FormFields {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  description: string;
  recipient: string;
}

export type SignAndExecuteFn = (input: {
  transaction: Transaction;
}) => Promise<{ digest: string }>;

interface MintData {
  form: FormFields;
  status: CoinStatus;
  network?: SuiNetworkId;
  digest?: string;
  packageId?: string;
  treasuryCapId?: string;
  coinId?: string;
  errorMessage?: string;
}

const INITIAL_FORM: FormFields = {
  name: "",
  symbol: "",
  decimals: 9,
  supply: "1000000",
  description: "",
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
    this.data.digest = undefined;
    this.data.packageId = undefined;
    this.data.treasuryCapId = undefined;
    this.data.coinId = undefined;
    this.data.errorMessage = undefined;
  }

  async submit(opts: {
    sender: string;
    network: SuiNetworkId;
    client: SuiJsonRpcClient;
    signAndExecute: SignAndExecuteFn;
  }) {
    try {
      this.data.errorMessage = undefined;
      this.data.network = opts.network;
      this.data.status = "signing";

      const f = this.data.form;
      const supply = parseUnits(f.supply, f.decimals);
      // Sui Coin balance is u64. parseUnits returns bigint; guard the range.
      if (supply > 0xffffffffffffffffn) {
        throw new Error(
          `Supply * 10^decimals exceeds u64 max (~18.4 quintillion smallest units). Reduce supply or decimals.`,
        );
      }

      const tx = await prepareCoinPublish({
        name: f.name,
        symbol: f.symbol,
        decimals: f.decimals,
        initialSupply: supply,
        description: f.description,
        recipient: f.recipient || opts.sender,
      });

      const result = await opts.signAndExecute({ transaction: tx });
      this.data.digest = result.digest;
      this.data.status = "pending";

      const fullResult: SuiTransactionBlockResponse =
        await opts.client.waitForTransaction({
          digest: result.digest,
          options: { showObjectChanges: true, showEffects: true },
        });

      const { packageId, treasuryCapId, initialCoinId } = extractPublishResult(
        fullResult.objectChanges,
      );

      this.data.packageId = packageId;
      this.data.treasuryCapId = treasuryCapId;
      this.data.coinId = initialCoinId;
      this.data.status = "success";

      if (packageId) {
        addToHistory({
          chain: "sui",
          chainId: 0,
          template: "coin",
          address: packageId,
          name: f.name,
          symbol: f.symbol,
          decimals: f.decimals,
          txHash: result.digest,
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      this.data.errorMessage = e instanceof Error ? e.message : String(e);
      this.data.status = "error";
    }
  }
}
