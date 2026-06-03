import { ViewModelBase } from "bizify";
import {
  deployContract,
  estimateGas,
  getAccount,
  waitForTransactionReceipt,
} from "wagmi/actions";
import { encodeDeployData, getAddress } from "viem";
import { zamaWagmiConfig } from "../client";
import { addToHistory } from "../../../lib/history";
import artifact from "../abi/TokenForgeConfidential.json";

export type MintStatus = "idle" | "signing" | "pending" | "success" | "error";

export interface FormFields {
  name: string;
  symbol: string;
  contractURI: string;
  /** Plaintext uint64 — trivially encrypted in the constructor. Decimals are
   *  fixed at 6 by ERC-7984's default, so 1_000_000 here = 1 token visually. */
  initialSupply: string;
  recipient: string;
}

export interface MintData {
  form: FormFields;
  status: MintStatus;
  txHash?: `0x${string}`;
  contractAddress?: `0x${string}`;
  chainId?: number;
  errorMessage?: string;
}

// ERC-7984 default decimals is 6, so 1_000_000 raw units = 1 token visually.
const INITIAL_FORM: FormFields = {
  name: "",
  symbol: "",
  contractURI: "",
  initialSupply: "1000000",
  recipient: "",
};

// Max uint64.
const U64_MAX = 0xffffffffffffffffn;

export class MintPageVM extends ViewModelBase<MintData> {
  protected $data(): MintData {
    return { form: { ...INITIAL_FORM }, status: "idle" };
  }

  setField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    this.data.form[key] = value;
  }

  reset() {
    this.data.status = "idle";
    this.data.txHash = undefined;
    this.data.contractAddress = undefined;
    this.data.errorMessage = undefined;
  }

  async submit() {
    try {
      const account = getAccount(zamaWagmiConfig);
      if (!account.address || !account.chainId) {
        throw new Error("Wallet not connected");
      }

      const f = this.data.form;
      const recipient = f.recipient ? getAddress(f.recipient) : account.address;

      // ERC-7984 stores raw integer units (no decimals scaling applied here —
      // decimals is a metadata-only field). User enters the raw u64.
      const supply = BigInt(f.initialSupply || "0");
      if (supply < 0n || supply > U64_MAX) {
        throw new Error(`Initial supply must fit in uint64 (≤ ${U64_MAX}).`);
      }

      this.data.errorMessage = undefined;
      this.data.chainId = account.chainId;
      this.data.status = "signing";

      const args = [f.name, f.symbol, f.contractURI, supply, recipient] as const;

      // Pre-estimate gas — FHE setCoprocessor + _mint do heavy work, and some
      // wallets fail to estimate constructor gas reliably. 10% buffer.
      let gas: bigint | undefined;
      try {
        const data = encodeDeployData({
          abi: artifact.abi,
          bytecode: artifact.bytecode as `0x${string}`,
          args,
        });
        const estimated = await estimateGas(zamaWagmiConfig, {
          account: account.address,
          data,
        });
        gas = estimated + estimated / 10n;
      } catch (e) {
        console.warn("[zama mint] gas estimation failed, falling back to wallet:", e);
      }

      const hash = await deployContract(zamaWagmiConfig, {
        abi: artifact.abi,
        bytecode: artifact.bytecode as `0x${string}`,
        args,
        account: account.address,
        gas,
      });

      this.data.txHash = hash;
      this.data.status = "pending";

      const receipt = await waitForTransactionReceipt(zamaWagmiConfig, { hash });
      if (!receipt.contractAddress) {
        throw new Error("Receipt missing contract address");
      }

      this.data.contractAddress = receipt.contractAddress;
      this.data.status = "success";

      addToHistory({
        chain: "zama",
        chainId: account.chainId,
        template: "confidential",
        address: receipt.contractAddress,
        name: f.name,
        symbol: f.symbol,
        decimals: 6,
        txHash: hash,
        timestamp: Date.now(),
      });
    } catch (e) {
      this.data.errorMessage = e instanceof Error ? e.message : String(e);
      this.data.status = "error";
    }
  }
}
