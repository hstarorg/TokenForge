// Base64-encoded BOC for the standard TEP-74 Jetton master + wallet bytecode.
//
// These are populated by `pnpm sync-abi` after `acton build` runs over the
// contracts/ton/ Tolk project. Until then, MintPageVM throws a clear error at
// submit() time so the rest of the UI can still render and develop.
//
// IMPORTANT: the storage layout, opcodes, and data-cell encoding in
// MintPageVM.ts MUST match whatever jetton master implementation we compile
// into these BOCs. See the comment block in MintPageVM for the spec we target.

export const JETTON_MASTER_CODE_BOC = "";
export const JETTON_WALLET_CODE_BOC = "";
