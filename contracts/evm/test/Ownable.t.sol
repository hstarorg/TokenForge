// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {TokenForgeOwnable} from "../src/TokenForgeOwnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract TokenForgeOwnableTest is Test {
    address constant CREATOR = address(0xCAFE);
    address constant RECIPIENT = address(0xBEEF);
    address constant OWNER = address(0xD00D);
    address constant USER = address(0x1);

    function _deploy(uint256 supply, uint256 cap) internal returns (TokenForgeOwnable) {
        vm.prank(CREATOR);
        return new TokenForgeOwnable("Own", "OWN", 18, supply, RECIPIENT, OWNER, cap);
    }

    function test_OwnerAndCap() public {
        TokenForgeOwnable t = _deploy(1000 ether, 5000 ether);
        assertEq(t.owner(), OWNER);
        assertEq(t.cap(), 5000 ether);
    }

    function test_RevertIf_MaxBelowInitial() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                TokenForgeOwnable.MaxSupplyBelowInitial.selector, 100 ether, 200 ether
            )
        );
        new TokenForgeOwnable("Own", "OWN", 18, 200 ether, RECIPIENT, OWNER, 100 ether);
    }

    function test_OnlyOwnerCanMint() public {
        TokenForgeOwnable t = _deploy(1000 ether, 5000 ether);
        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, USER)
        );
        vm.prank(USER);
        t.mint(USER, 100 ether);

        vm.prank(OWNER);
        t.mint(USER, 100 ether);
        assertEq(t.balanceOf(USER), 100 ether);
        assertEq(t.totalSupply(), 1100 ether);
    }

    function test_RevertIf_MintExceedsCap() public {
        TokenForgeOwnable t = _deploy(1000 ether, 1500 ether);
        vm.prank(OWNER);
        vm.expectRevert(
            abi.encodeWithSelector(ERC20Capped.ERC20ExceededCap.selector, 2000 ether, 1500 ether)
        );
        t.mint(USER, 1000 ether);
    }

    function test_PauseBlocksTransfer() public {
        TokenForgeOwnable t = _deploy(1000 ether, 5000 ether);
        vm.prank(OWNER);
        t.pause();

        vm.expectRevert(Pausable.EnforcedPause.selector);
        vm.prank(RECIPIENT);
        t.transfer(USER, 1 ether);

        vm.prank(OWNER);
        t.unpause();
        vm.prank(RECIPIENT);
        t.transfer(USER, 1 ether);
        assertEq(t.balanceOf(USER), 1 ether);
    }

    function test_TransferOwnership() public {
        TokenForgeOwnable t = _deploy(1000 ether, 5000 ether);
        vm.prank(OWNER);
        t.transferOwnership(USER);
        assertEq(t.owner(), USER);
    }
}
