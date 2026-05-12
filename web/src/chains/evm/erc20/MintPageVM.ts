import { ViewModelBase } from "bizify";
import {
  deployContract,
  estimateGas,
  getAccount,
  waitForTransactionReceipt,
} from "wagmi/actions";
import { encodeDeployData, getAddress, parseUnits } from "viem";
import { wagmiConfig } from "../client";
import { addToHistory } from "../../../lib/history";
import { getTemplate, type TemplateId } from "./templates";

export type MintStatus = "idle" | "signing" | "pending" | "success" | "error";

export interface FormFields {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  recipient: string;
  owner: string;
  maxSupply: string;
}

export interface MintData {
  selectedTemplate: TemplateId;
  form: FormFields;
  status: MintStatus;
  txHash?: `0x${string}`;
  contractAddress?: `0x${string}`;
  errorMessage?: string;
}

const INITIAL_FORM: FormFields = {
  name: "",
  symbol: "",
  decimals: 18,
  initialSupply: "1000000",
  recipient: "",
  owner: "",
  maxSupply: "",
};

export class MintPageVM extends ViewModelBase<MintData> {
  protected $data(): MintData {
    return {
      selectedTemplate: "basic",
      form: { ...INITIAL_FORM },
      status: "idle",
    };
  }

  selectTemplate(id: TemplateId) {
    this.data.selectedTemplate = id;
    if (id === "ownable" && !this.data.form.maxSupply) {
      this.data.form.maxSupply = this.data.form.initialSupply;
    }
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
      const account = getAccount(wagmiConfig);
      if (!account.address || !account.chainId) {
        throw new Error("Wallet not connected");
      }

      const tpl = getTemplate(this.data.selectedTemplate);
      const f = this.data.form;

      const recipient = f.recipient ? getAddress(f.recipient) : account.address;
      const initialSupply = parseUnits(f.initialSupply, f.decimals);

      const args: readonly unknown[] = (() => {
        if (tpl.id === "ownable") {
          const owner = f.owner ? getAddress(f.owner) : account.address;
          const maxSupply = parseUnits(f.maxSupply || f.initialSupply, f.decimals);
          return [f.name, f.symbol, f.decimals, initialSupply, recipient, owner, maxSupply];
        }
        return [f.name, f.symbol, f.decimals, initialSupply, recipient];
      })();

      this.data.errorMessage = undefined;
      this.data.status = "signing";

      // Pre-estimate gas via the dapp's RPC. Some wallets fail to estimate
      // gas for contract creation; passing an explicit `gas` avoids that.
      let gas: bigint | undefined;
      try {
        const data = encodeDeployData({ abi: tpl.abi, bytecode: tpl.bytecode, args });
        const estimated = await estimateGas(wagmiConfig, {
          account: account.address,
          data,
        });
        gas = estimated + estimated / 10n; // 10% buffer
      } catch (e) {
        console.warn("[mint] gas estimation failed, falling back to wallet:", e);
      }

      const hash = await deployContract(wagmiConfig, {
        abi: tpl.abi,
        bytecode: tpl.bytecode,
        args,
        account: account.address,
        gas,
      });

      this.data.txHash = hash;
      this.data.status = "pending";

      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      if (!receipt.contractAddress) {
        throw new Error("Receipt missing contract address");
      }

      this.data.contractAddress = receipt.contractAddress;
      this.data.status = "success";

      addToHistory({
        chain: "evm",
        chainId: account.chainId,
        template: tpl.id,
        address: receipt.contractAddress,
        name: f.name,
        symbol: f.symbol,
        decimals: f.decimals,
        txHash: hash,
        timestamp: Date.now(),
      });
    } catch (e) {
      this.data.errorMessage = e instanceof Error ? e.message : String(e);
      this.data.status = "error";
    }
  }
}
