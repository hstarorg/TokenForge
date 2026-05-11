// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {TokenForgeBasic} from "../src/TokenForgeBasic.sol";
import {TokenForgeBurnable} from "../src/TokenForgeBurnable.sol";
import {TokenForgeOwnable} from "../src/TokenForgeOwnable.sol";
import {TokenForgeGovernance} from "../src/TokenForgeGovernance.sol";

/// @notice Deploy one TokenForge ERC-20 template. Pick via env TEMPLATE.
///
/// Required env: TEMPLATE, NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, RECIPIENT
/// Required for `ownable`: OWNER, MAX_SUPPLY
///
/// Usage:
///   TEMPLATE=basic NAME=MyToken SYMBOL=MTK DECIMALS=18 \
///   INITIAL_SUPPLY=1000000000000000000000000 RECIPIENT=0x... \
///   forge script script/Deploy.s.sol --rpc-url $RPC --private-key $PK --broadcast
contract Deploy is Script {
    function run() external {
        string memory template = vm.envString("TEMPLATE");
        string memory name = vm.envString("NAME");
        string memory symbol = vm.envString("SYMBOL");
        uint8 decimals = uint8(vm.envUint("DECIMALS"));
        uint256 supply = vm.envUint("INITIAL_SUPPLY");
        address recipient = vm.envAddress("RECIPIENT");

        bytes32 t = keccak256(bytes(template));
        vm.startBroadcast();

        address deployed;
        if (t == keccak256("basic")) {
            deployed = address(new TokenForgeBasic(name, symbol, decimals, supply, recipient));
        } else if (t == keccak256("burnable")) {
            deployed = address(new TokenForgeBurnable(name, symbol, decimals, supply, recipient));
        } else if (t == keccak256("ownable")) {
            address owner = vm.envAddress("OWNER");
            uint256 cap = vm.envUint("MAX_SUPPLY");
            deployed = address(
                new TokenForgeOwnable(name, symbol, decimals, supply, recipient, owner, cap)
            );
        } else if (t == keccak256("governance")) {
            deployed =
                address(new TokenForgeGovernance(name, symbol, decimals, supply, recipient));
        } else {
            revert(string.concat("Unknown TEMPLATE: ", template));
        }

        vm.stopBroadcast();

        console.log("Template:", template);
        console.log("Address: ", deployed);
        console.log("Chain:   ", block.chainid);
    }
}
