// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenForgeOwnable is ERC20, ERC20Burnable, ERC20Pausable, ERC20Capped, Ownable {
    event TokenForgeDeployed(
        address indexed creator, string name, string symbol, uint256 initialSupply
    );

    error MaxSupplyBelowInitial(uint256 maxSupply, uint256 initialSupply);

    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        address recipient,
        address owner_,
        uint256 maxSupply
    ) ERC20(name_, symbol_) ERC20Capped(maxSupply) Ownable(owner_) {
        if (maxSupply < initialSupply) {
            revert MaxSupplyBelowInitial(maxSupply, initialSupply);
        }
        _decimals = decimals_;
        _mint(recipient, initialSupply);
        emit TokenForgeDeployed(msg.sender, name_, symbol_, initialSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable, ERC20Capped)
    {
        super._update(from, to, value);
    }
}
