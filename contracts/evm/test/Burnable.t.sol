// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {TokenForgeBurnable} from "../src/TokenForgeBurnable.sol";

contract TokenForgeBurnableTest is Test {
    address constant CREATOR = address(0xCAFE);
    address constant RECIPIENT = address(0xBEEF);
    address constant USER = address(0x1);

    function _deploy(uint256 supply) internal returns (TokenForgeBurnable) {
        vm.prank(CREATOR);
        return new TokenForgeBurnable("Burn", "BRN", 18, supply, RECIPIENT);
    }

    function test_Burn_ReducesSupply() public {
        TokenForgeBurnable t = _deploy(1000 ether);
        vm.prank(RECIPIENT);
        t.burn(100 ether);
        assertEq(t.totalSupply(), 900 ether);
        assertEq(t.balanceOf(RECIPIENT), 900 ether);
    }

    function test_BurnFrom_ConsumesAllowance() public {
        TokenForgeBurnable t = _deploy(1000 ether);
        vm.prank(RECIPIENT);
        t.approve(USER, 200 ether);
        vm.prank(USER);
        t.burnFrom(RECIPIENT, 150 ether);
        assertEq(t.totalSupply(), 850 ether);
        assertEq(t.allowance(RECIPIENT, USER), 50 ether);
    }
}
