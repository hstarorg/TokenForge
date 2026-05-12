import { ViewModelBase } from "bizify";
import {
  Connection,
  Keypair,
  PublicKey,
  type Signer,
  SystemProgram,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  AuthorityType,
  ExtensionType,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddressSync,
  getMintLen,
} from "@solana/spl-token";
import {
  type TokenMetadata,
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
} from "@solana/spl-token-metadata";
import { parseUnits } from "viem";
import { addToHistory } from "../../../lib/history";
import type { SolanaCluster } from "../networks";

export type SplStatus = "idle" | "signing" | "pending" | "success" | "error";

export interface FormFields {
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  recipient: string;
  uri: string;
  renounceMint: boolean;
  enableFreeze: boolean;
}

interface MintData {
  form: FormFields;
  status: SplStatus;
  cluster?: SolanaCluster;
  mintAddress?: string;
  txSignature?: string;
  errorMessage?: string;
}

export type SignTransactionFn = <T extends Transaction>(transaction: T) => Promise<T>;

const INITIAL_FORM: FormFields = {
  name: "",
  symbol: "",
  decimals: 9,
  supply: "1000000",
  recipient: "",
  uri: "",
  renounceMint: false,
  enableFreeze: false,
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
    this.data.mintAddress = undefined;
    this.data.txSignature = undefined;
    this.data.errorMessage = undefined;
  }

  async submit(opts: {
    connection: Connection;
    payer: PublicKey;
    signTransaction: SignTransactionFn;
    cluster: SolanaCluster;
  }) {
    try {
      this.data.errorMessage = undefined;
      this.data.cluster = opts.cluster;
      this.data.status = "signing";

      const { connection, payer, signTransaction } = opts;
      const f = this.data.form;

      const recipient = f.recipient ? new PublicKey(f.recipient) : payer;
      const supply = parseUnits(f.supply, f.decimals);

      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;

      const metadata: TokenMetadata = {
        mint,
        name: f.name,
        symbol: f.symbol,
        uri: f.uri || "",
        additionalMetadata: [["platform", "tokenforge"]],
      };

      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen,
      );

      const ata = getAssociatedTokenAddressSync(
        mint,
        recipient,
        false,
        TOKEN_2022_PROGRAM_ID,
      );

      const ixs: TransactionInstruction[] = [
        SystemProgram.createAccount({
          fromPubkey: payer,
          newAccountPubkey: mint,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mint,
          payer,
          mint,
          TOKEN_2022_PROGRAM_ID,
        ),
        createInitializeMintInstruction(
          mint,
          f.decimals,
          payer,
          f.enableFreeze ? payer : null,
          TOKEN_2022_PROGRAM_ID,
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: payer,
          mint,
          mintAuthority: payer,
          name: f.name,
          symbol: f.symbol,
          uri: f.uri || "",
        }),
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: payer,
          field: "platform",
          value: "tokenforge",
        }),
        createAssociatedTokenAccountInstruction(
          payer,
          ata,
          recipient,
          mint,
          TOKEN_2022_PROGRAM_ID,
        ),
        createMintToInstruction(mint, ata, payer, supply, [], TOKEN_2022_PROGRAM_ID),
      ];

      if (f.renounceMint) {
        ixs.push(
          createSetAuthorityInstruction(
            mint,
            payer,
            AuthorityType.MintTokens,
            null,
            [],
            TOKEN_2022_PROGRAM_ID,
          ),
        );
      }

      const latest = await connection.getLatestBlockhash();
      const tx = new Transaction({
        feePayer: payer,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      }).add(...ixs);

      // Mint keypair is an additional signer; partially sign first, then have
      // wallet sign as fee payer. Then broadcast via the dapp's connection so
      // the tx lands on the cluster we configured (devnet), not whatever RPC
      // the wallet happens to use internally.
      tx.partialSign(mintKeypair as Signer);
      const signedTx = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
      });

      this.data.txSignature = signature;
      this.data.status = "pending";

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight,
        },
        "confirmed",
      );

      this.data.mintAddress = mint.toBase58();
      this.data.status = "success";

      addToHistory({
        chain: "solana",
        chainId: 0,
        template: "spl",
        address: mint.toBase58(),
        name: f.name,
        symbol: f.symbol,
        decimals: f.decimals,
        txHash: signature,
        timestamp: Date.now(),
      });
    } catch (e) {
      this.data.errorMessage = e instanceof Error ? e.message : String(e);
      this.data.status = "error";
    }
  }
}
