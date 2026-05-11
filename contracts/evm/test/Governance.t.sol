// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {TokenForgeGovernance} from "../src/TokenForgeGovernance.sol";

contract TokenForgeGovernanceTest is Test {
    bytes32 constant PERMIT_TYPEHASH = keccak256(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );

    function _deploy(address recipient, uint256 supply) internal returns (TokenForgeGovernance) {
        return new TokenForgeGovernance("Gov", "GOV", 18, supply, recipient);
    }

    function test_DelegateActivatesVotes() public {
        address holder = address(0xBEEF);
        TokenForgeGovernance t = _deploy(holder, 1000 ether);
        assertEq(t.getVotes(holder), 0);

        vm.prank(holder);
        t.delegate(holder);
        assertEq(t.getVotes(holder), 1000 ether);
    }

    function test_NoncesStartAtZero() public {
        TokenForgeGovernance t = _deploy(address(0xBEEF), 1000 ether);
        assertEq(t.nonces(address(0xBEEF)), 0);
    }

    function test_PermitGrantsAllowance() public {
        uint256 ownerKey = 0xA11CE;
        address owner = vm.addr(ownerKey);
        address spender = address(0xBEEF);
        uint256 value = 100 ether;
        uint256 deadline = block.timestamp + 1 hours;

        TokenForgeGovernance t = _deploy(owner, 1000 ether);

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, owner, spender, value, t.nonces(owner), deadline)
        );
        bytes32 digest =
            keccak256(abi.encodePacked("\x19\x01", t.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerKey, digest);

        t.permit(owner, spender, value, deadline, v, r, s);

        assertEq(t.allowance(owner, spender), value);
        assertEq(t.nonces(owner), 1);
    }
}
