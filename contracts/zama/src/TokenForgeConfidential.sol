// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";

/**
 * @title TokenForgeConfidential
 * @notice ERC-7984 (Confidential Fungible Token) template for TokenForge. All
 *         post-deploy balances and transfers are encrypted via Zama FHE; only
 *         the initial supply is public, since it is "trivially" encrypted from
 *         a plaintext uint64 the deployer signs. Every subsequent transfer is
 *         fully confidential.
 *
 *         Lives on regular EVM (Ethereum mainnet / Sepolia) with the Zama
 *         coprocessor wired in via {ZamaConfig}.
 */
contract TokenForgeConfidential is ERC7984 {
    /// @dev Emitted once in the constructor. `initialSupply` is the plaintext
    ///      uint64 that was trivially encrypted on-chain — knowing it doesn't
    ///      compromise privacy for later transfers, which use real FHE inputs.
    event TokenForgeDeployed(
        address indexed creator,
        string name,
        string symbol,
        uint64 initialSupply
    );

    constructor(
        string memory name_,
        string memory symbol_,
        string memory contractURI_,
        uint64 initialSupply,
        address recipient
    ) ERC7984(name_, symbol_, contractURI_) {
        FHE.setCoprocessor(ZamaConfig.getEthereumCoprocessorConfig());

        if (initialSupply > 0) {
            euint64 amount = FHE.asEuint64(initialSupply);
            _mint(recipient, amount);
        }

        emit TokenForgeDeployed(msg.sender, name_, symbol_, initialSupply);
    }
}
