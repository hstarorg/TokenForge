// All Starknet ERC-20 deploy-time encoding and address derivation lives here.
// Wallet-agnostic — returns a Call descriptor that any starknet.js Account
// (connected wallet or backend deployer) can execute.

import { byteArray, CallData, cairo, hash, num } from "starknet";
import type { StarknetNetworkId } from "../networks";
import {
  TOKENFORGE_ERC20_CLASS_HASH_MAINNET,
  TOKENFORGE_ERC20_CLASS_HASH_SEPOLIA,
} from "./class-hashes";

// Universal Deployer Contract. Deployed at the same canonical address on
// both Sepolia and Mainnet. See https://docs.starknet.io/architecture/messaging/.
export const UDC_ADDRESS =
  "0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf";

export interface Erc20DeployArgs {
  network: StarknetNetworkId;
  /** Deployer / caller — used in UDC unique-address derivation and as the default recipient. */
  caller: string;
  name: string;
  symbol: string;
  decimals: number;
  /** Already scaled by decimals (e.g. 1_000_000 * 10^9 for 1M tokens at 9 dp). */
  initialSupply: bigint;
  /** Defaults to caller. */
  recipient?: string;
}

export interface DeployPlan {
  /** Deterministic address of the to-be-deployed contract. */
  contractAddress: string;
  /** Single multicall Call descriptor for `account.execute([call])`. */
  call: {
    contractAddress: string;
    entrypoint: string;
    calldata: string[];
  };
  classHash: string;
}

export function classHashForNetwork(network: StarknetNetworkId): string {
  return network === "mainnet"
    ? TOKENFORGE_ERC20_CLASS_HASH_MAINNET
    : TOKENFORGE_ERC20_CLASS_HASH_SEPOLIA;
}

// Build the felts that get passed as the ERC-20 constructor calldata.
function buildConstructorCalldata(args: {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  recipient: string;
}): string[] {
  return CallData.compile([
    byteArray.byteArrayFromString(args.name),
    byteArray.byteArrayFromString(args.symbol),
    args.decimals,
    cairo.uint256(args.initialSupply),
    args.recipient,
  ]);
}

// Salt derived deterministically from form fields so the predicted address
// matches the on-chain deploy address — same approach as the EVM Create2 /
// TON StateInit pattern. Two users with identical form values still get
// distinct addresses because we use UDC `unique=true` (which mixes the caller
// address into the salt).
function deriveSalt(args: {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  recipient: string;
}): string {
  const inputs = [
    hash.starknetKeccak(args.name),
    hash.starknetKeccak(args.symbol),
    BigInt(args.decimals),
    args.initialSupply,
    num.toBigInt(args.recipient),
  ];
  return num.toHex(hash.computePoseidonHashOnElements(inputs));
}

export function prepareErc20Deploy(args: Erc20DeployArgs): DeployPlan {
  const classHash = classHashForNetwork(args.network);
  if (!classHash) {
    throw new Error(
      `TokenForge ERC-20 class not declared on ${args.network}. Run \`pnpm starknet:declare\` to declare it, then paste the class hash into web/src/chains/starknet/erc20/class-hashes.ts.`,
    );
  }

  const recipient = args.recipient || args.caller;
  const constructorCalldata = buildConstructorCalldata({
    name: args.name,
    symbol: args.symbol,
    decimals: args.decimals,
    initialSupply: args.initialSupply,
    recipient,
  });

  const salt = deriveSalt({
    name: args.name,
    symbol: args.symbol,
    decimals: args.decimals,
    initialSupply: args.initialSupply,
    recipient,
  });

  // UDC unique=true mixes the caller address into the salt, ensuring two
  // callers with identical form inputs land on different addresses.
  const finalSalt = num.toHex(
    hash.computePedersenHash(num.toHex(args.caller), salt),
  );

  const contractAddress = hash.calculateContractAddressFromHash(
    finalSalt,
    classHash,
    constructorCalldata,
    UDC_ADDRESS,
  );

  // UDC `deployContract(classHash, salt, unique, calldata)` — the calldata
  // Span is encoded as [length, ...elements] by CallData.compile when wrapped.
  const call = {
    contractAddress: UDC_ADDRESS,
    entrypoint: "deployContract",
    calldata: CallData.compile([
      classHash,
      salt,
      cairo.felt(1), // unique = true
      constructorCalldata,
    ]),
  };

  return { contractAddress, call, classHash };
}
