// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./NFTCurrency.sol";
import "./Utils.sol";

contract NameSpaceToken is ERC20Capped, ERC20Burnable, NFTCurrency {
    uint256 private immutable i_initialTokenSupply;

    constructor(uint256 initialTokenSupply)
        payable
        ERC20("NameSpace", "NAST")
        ERC20Capped(convertDecimals(initialTokenSupply, decimals()))
    {
        _mint(owner(), convertDecimals(initialTokenSupply, decimals()));
        i_initialTokenSupply = convertDecimals(initialTokenSupply, decimals());
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Capped) {
        return super._update(from, to, value);
    }

    function tokenBurnedForNftMinting(
        uint256 amount,
        uint256 nftMintedId,
        address nftOwner,
        string memory nftString
    ) external override onlyNftContract {
        emit TokenBurnedForNftMinting(amount, nftMintedId, nftOwner, nftString);
        _burn(nftOwner, amount);
    }

    function getCurrentTokenSupply() external view override returns (uint256) {
        return totalSupply();
    }

    function getInitialTokenSupply() external view override returns (uint256) {
        return i_initialTokenSupply;
    }
}
