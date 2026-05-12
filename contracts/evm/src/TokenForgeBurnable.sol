// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract TokenForgeBurnable is ERC20, ERC20Burnable {
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
    ) ERC20(name_, symbol_) {
        _decimals = decimals_;
        _mint(recipient, initialSupply);
        emit TokenForgeDeployed(msg.sender, name_, symbol_, initialSupply);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
