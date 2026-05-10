#!/usr/bin/env tsx
// Sync compiled contract artifacts (ABIs / IDLs) into web/src/chains/<chain>/{abi,idl}/.
//
// Usage:
//   pnpm sync-abi              sync all chains
//   pnpm sync-abi --chain evm  sync one chain

const args = process.argv.slice(2);
const chainFlagIdx = args.indexOf("--chain");
const onlyChain = chainFlagIdx >= 0 ? args[chainFlagIdx + 1] : null;

const ALL_CHAINS = ["evm", "solana", "sui", "aptos", "ton", "starknet"] as const;
type Chain = (typeof ALL_CHAINS)[number];

const targets: Chain[] = onlyChain
  ? [onlyChain as Chain]
  : [...ALL_CHAINS];

for (const c of targets) {
  console.log(`[sync-abi] ${c}: not implemented yet`);
}
