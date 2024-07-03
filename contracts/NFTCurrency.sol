// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract NFTCurrency is Ownable {
    bool private s_onceFlag;
    address private s_nftAddress;

    event NftSet(address nftAddress, uint256 time);

    event TokenBurnedForNftMinting(
        uint256 amount,
        uint256 nftMintedId,
        address nftOwner,
        string nftString
    );

    error NftAlreadySet();
    error CallerIsNotApprovedNftContract();

    modifier onlyOnce() {
        if (s_onceFlag) {
            revert NftAlreadySet();
        }
        s_onceFlag = true;
        _;
    }

    constructor() payable Ownable(msg.sender) {}

    modifier onlyNftContract() {
        if (msg.sender != s_nftAddress) {
            revert CallerIsNotApprovedNftContract();
        }
        _;
    }

    function nftAddress() public view returns (address) {
        return s_nftAddress;
    }

    // payable to reduce gas cost
    function setNFTAddress(address addr) external payable onlyOnce onlyOwner {
        if (addr == address(0)) revert("Invalid address");
        emit NftSet(s_nftAddress, block.timestamp);
        s_nftAddress = addr;
    }

    function tokenBurnedForNftMinting(
        uint256 amount,
        uint256 nftMintedId,
        address nftOwner,
        string memory nftString
    ) external virtual;

    function getCurrentTokenSupply() external view virtual returns (uint256);

    function getInitialTokenSupply() external view virtual returns (uint256);
}
