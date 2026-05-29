//! TokenForge ERC-20.
//!
//! Thin wrapper over OpenZeppelin's ERC20Component. Adds:
//!   - User-settable decimals (storage slot, overrides component default of 18)
//!   - TokenForgeDeployed event emitted once in the constructor for indexers
//!     to discover platform deployments.
//!
//! The constructor mints the full supply to `recipient`. No admin / mint / burn
//! external surface beyond the standard ERC-20 — supply is fixed at deploy.

#[starknet::contract]
mod TokenForgeERC20 {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use openzeppelin_interfaces::token::erc20::IERC20Metadata;
    use starknet::ContractAddress;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    // Standard transfer / balance / allowance externals from the component.
    // NB: we do NOT embed ERC20MetadataImpl from the component — we replace it
    // below with our own implementation that reads decimals from storage.
    #[abi(embed_v0)]
    impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC20CamelOnlyImpl = ERC20Component::ERC20CamelOnlyImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        token_decimals: u8,
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        TokenForgeDeployed: TokenForgeDeployed,
    }

    /// Emitted once from the constructor. Indexers can filter on the event
    /// selector to enumerate every token deployed via TokenForge.
    #[derive(Drop, starknet::Event)]
    pub struct TokenForgeDeployed {
        #[key]
        pub creator: ContractAddress,
        pub name: ByteArray,
        pub symbol: ByteArray,
        pub decimals: u8,
        pub initial_supply: u256,
    }

    #[abi(embed_v0)]
    impl ERC20MetadataImpl of IERC20Metadata<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.erc20.ERC20_name.read()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc20.ERC20_symbol.read()
        }

        fn decimals(self: @ContractState) -> u8 {
            self.token_decimals.read()
        }
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        initial_supply: u256,
        recipient: ContractAddress,
    ) {
        let name_for_event = name.clone();
        let symbol_for_event = symbol.clone();
        self.erc20.initializer(name, symbol);
        self.token_decimals.write(decimals);
        self.erc20.mint(recipient, initial_supply);
        self.emit(TokenForgeDeployed {
            creator: recipient,
            name: name_for_event,
            symbol: symbol_for_event,
            decimals,
            initial_supply,
        });
    }
}
