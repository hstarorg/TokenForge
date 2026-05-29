/// TokenForge Aptos launcher.
///
/// One pre-deployed entry function, `create_fa`, turns form input into a
/// brand-new Fungible Asset with permanently-capped supply.
///
/// Design:
///   - Supply is hard-capped at `initial_supply` (max_supply = Some(initial_supply)).
///   - `MintRef` is generated inside the same tx, used to mint the initial
///     supply, then dropped at end of scope. Future minting is impossible.
///   - `TransferRef` / `BurnRef` are never generated, so the launcher cannot
///     transfer or burn on the user's behalf either.
///   - The resulting Metadata object is owned by the deployer and operates
///     under the standard `primary_fungible_store` + `fungible_asset` APIs.
///     No runtime dependency on this launcher after the create tx.
///
/// Discovery: the `TokenForgeDeployed` event is emitted from this module, so
/// indexers can enumerate every TokenForge-issued FA by filtering for events
/// of type `<launcher_addr>::launcher::TokenForgeDeployed`.
module tokenforge::launcher {
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::event;
    use aptos_framework::fungible_asset;
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;

    #[event]
    struct TokenForgeDeployed has drop, store {
        creator: address,
        metadata_address: address,
        name: String,
        symbol: String,
        decimals: u8,
        initial_supply: u64,
    }

    public entry fun create_fa(
        deployer: &signer,
        name: String,
        symbol: String,
        decimals: u8,
        initial_supply: u64,
        icon_uri: String,
        project_uri: String,
    ) {
        let deployer_addr = signer::address_of(deployer);

        // Seed the named-object address with the symbol so a single deployer
        // can issue multiple FAs without collision (different symbols give
        // different object addresses). Two deployers with the same symbol
        // still get distinct addresses (seeded with deployer_addr).
        let constructor_ref = object::create_named_object(deployer, *string::bytes(&symbol));

        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            &constructor_ref,
            option::some((initial_supply as u128)),
            name,
            symbol,
            decimals,
            icon_uri,
            project_uri,
        );

        let metadata_addr = object::address_from_constructor_ref(&constructor_ref);

        if (initial_supply > 0) {
            let mint_ref = fungible_asset::generate_mint_ref(&constructor_ref);
            let fa = fungible_asset::mint(&mint_ref, initial_supply);
            primary_fungible_store::deposit(deployer_addr, fa);
            // mint_ref dropped at end of scope: supply is permanently capped.
        };

        event::emit(TokenForgeDeployed {
            creator: deployer_addr,
            metadata_address: metadata_addr,
            name,
            symbol,
            decimals,
            initial_supply,
        });
    }
}
