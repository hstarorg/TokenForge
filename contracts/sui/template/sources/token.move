// Minimal Coin template. Compiled bytecode is vendored into the frontend, which
// patches the placeholders below via @mysten/move-bytecode-template before
// publishing the per-user package.
//
// What gets patched at publish time:
//   - vector<u8> constant b"NAME_PLACEHOLDER______________"
//   - vector<u8> constant b"SYM_PH"
//   - vector<u8> constant b"DESCRIPTION_PLACEHOLDER____________________"
//   - u8 constant 222   (decimals; sentinel value, unlikely to clash)
//   - u64 constant 1234567890123 (initial_supply in smallest units)
//
// The module/struct names are intentionally NOT patched — every TokenForge
// coin keeps the type path `<package_id>::token::TOKEN`, which lets indexers
// filter platform deployments by module + struct name across all packages
// without scanning every package's bytecode.
module tokenforge_coin_template::token;

use sui::coin;
use sui::event;
use sui::url;

/// One-time witness. The OTW struct name must equal the module name in upper
/// case ("TOKEN" matches "token"). Sui enforces this at publish.
public struct TOKEN has drop {}

/// Emitted once in `init`. Indexers filter by event type
/// `<any-package>::token::TokenForgeDeployed` to enumerate all platform-issued
/// coins regardless of the publisher's package id.
public struct TokenForgeDeployed has copy, drop {
    creator: address,
    package: address,
    name: vector<u8>,
    symbol: vector<u8>,
    decimals: u8,
    initial_supply: u64,
}

fun init(witness: TOKEN, ctx: &mut TxContext) {
    // PATCHED at publish: replaced via update_constants.
    let decimals: u8 = 222;
    let symbol: vector<u8> = b"SYM_PH";
    let name: vector<u8> = b"NAME_PLACEHOLDER______________";
    let description: vector<u8> = b"DESCRIPTION_PLACEHOLDER____________________";
    let initial_supply: u64 = 1234567890123;

    let (mut treasury_cap, metadata) = coin::create_currency(
        witness,
        decimals,
        symbol,
        name,
        description,
        option::none<url::Url>(),
        ctx,
    );

    // Freeze metadata so wallets and explorers can rely on it being immutable.
    transfer::public_freeze_object(metadata);

    let sender = ctx.sender();

    if (initial_supply > 0) {
        let coin = coin::mint(&mut treasury_cap, initial_supply, ctx);
        transfer::public_transfer(coin, sender);
    };

    // Hand the TreasuryCap to the sender — they control future mint/burn.
    transfer::public_transfer(treasury_cap, sender);

    event::emit(TokenForgeDeployed {
        creator: sender,
        package: @tokenforge_coin_template,
        name,
        symbol,
        decimals,
        initial_supply,
    });
}
