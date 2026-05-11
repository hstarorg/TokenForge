// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

contract TokenForgeGovernance is ERC20, ERC20Permit, ERC20Votes {
    event TokenForgeDeployed(
        address indexed creator, string name, string symbol, uint256 initialSupply
    );

    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        address recipient
    ) ERC20(name_, symbol_) ERC20Permit(name_) {
        _decimals = decimals_;
        _mint(recipient, initialSupply);
        emit TokenForgeDeployed(msg.sender, name_, symbol_, initialSupply);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner_)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner_);
    }
}
