// Aptos Fungible Asset deploy via the pre-published TokenForge launcher.
//
// The launcher's `create_fa` entry function:
//   - Creates a named-object Metadata seeded with (deployer_addr, symbol).
//   - Calls `primary_fungible_store::create_primary_store_enabled_fungible_asset`
//     with max_supply = Some(initial_supply) (permanent hard cap).
//   - Mints initial_supply to the deployer, then drops the MintRef.
//   - Emits TokenForgeDeployed event.
//
// Frontend just packages the entry-function call. Wallet adapter signs and
// submits; the resulting FA is fully standard and has no runtime dependency
// on the launcher.

import { AccountAddress, createObjectAddress } from "@aptos-labs/ts-sdk";
import type { InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk";
import {
  LAUNCHER_FUNCTION,
  LAUNCHER_MODULE,
  TOKENFORGE_LAUNCHER_ADDRESS_MAINNET,
  TOKENFORGE_LAUNCHER_ADDRESS_TESTNET,
} from "./launcher-address";
import type { AptosNetworkId } from "../networks";

export interface FaDeployArgs {
  network: AptosNetworkId;
  deployer: string;
  name: string;
  symbol: string;
  decimals: number;
  /** Already scaled by decimals; max u64. */
  initialSupply: bigint;
  iconUri: string;
  projectUri: string;
}

export interface DeployPlan {
  /** Deterministic Metadata object address (predicted before tx). */
  metadataAddress: string;
  /** Wallet-adapter `signAndSubmitTransaction({ data })` payload. */
  payload: InputGenerateTransactionPayloadData;
  launcherAddress: string;
}

export function launcherAddressForNetwork(network: AptosNetworkId): string {
  return network === "mainnet"
    ? TOKENFORGE_LAUNCHER_ADDRESS_MAINNET
    : TOKENFORGE_LAUNCHER_ADDRESS_TESTNET;
}

export function prepareFaDeploy(args: FaDeployArgs): DeployPlan {
  const launcherAddress = launcherAddressForNetwork(args.network);
  if (!launcherAddress) {
    throw new Error(
      `TokenForge launcher not deployed on ${args.network}. Run \`pnpm aptos:deploy\` against a funded ${args.network} account and paste the printed address into web/src/chains/aptos/fa/launcher-address.ts.`,
    );
  }

  // Mirror Aptos's `object::create_named_object` derivation: the Metadata
  // object address is sha3_256(deployer_addr || seed || [0xfc]). seed is the
  // raw symbol bytes (matches the launcher's `*string::bytes(&symbol)`).
  const metadataAddress = createObjectAddress(
    AccountAddress.from(args.deployer),
    args.symbol,
  ).toString();

  const payload: InputGenerateTransactionPayloadData = {
    function: `${launcherAddress}::${LAUNCHER_MODULE}::${LAUNCHER_FUNCTION}`,
    functionArguments: [
      args.name,
      args.symbol,
      args.decimals,
      args.initialSupply.toString(),
      args.iconUri,
      args.projectUri,
    ],
  };

  return { metadataAddress, payload, launcherAddress };
}
