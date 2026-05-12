// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {TokenForgeBasic} from "../src/TokenForgeBasic.sol";

contract TokenForgeBasicTest is Test {
    address constant CREATOR = address(0xCAFE);
    address constant RECIPIENT = address(0xBEEF);
    address constant USER = address(0x1);

    event TokenForgeDeployed(
        address indexed creator, string name, string symbol, uint256 initialSupply
    );

    function _deploy(uint8 decimals_, uint256 supply) internal returns (TokenForgeBasic) {
        vm.prank(CREATOR);
        return new TokenForgeBasic("MyToken", "MYT", decimals_, supply, RECIPIENT);
    }

    function test_InitialState() public {
        TokenForgeBasic t = _deploy(18, 1_000_000 ether);
        assertEq(t.name(), "MyToken");
        assertEq(t.symbol(), "MYT");
        assertEq(t.decimals(), 18);
        assertEq(t.totalSupply(), 1_000_000 ether);
        assertEq(t.balanceOf(RECIPIENT), 1_000_000 ether);
    }

    function test_CustomDecimals() public {
        TokenForgeBasic t = _deploy(6, 1_000_000 * 1e6);
        assertEq(t.decimals(), 6);
    }

    function test_Transfer() public {
        TokenForgeBasic t = _deploy(18, 1000 ether);
        vm.prank(RECIPIENT);
        t.transfer(USER, 100 ether);
        assertEq(t.balanceOf(USER), 100 ether);
        assertEq(t.balanceOf(RECIPIENT), 900 ether);
    }

    function test_EmitsTokenForgeDeployed() public {
        vm.expectEmit(true, false, false, true);
        emit TokenForgeDeployed(CREATOR, "MyToken", "MYT", 1000);
        vm.prank(CREATOR);
        new TokenForgeBasic("MyToken", "MYT", 18, 1000, RECIPIENT);
    }
}
