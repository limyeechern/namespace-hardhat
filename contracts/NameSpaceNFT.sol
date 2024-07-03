// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./Utils.sol";
import "./NameSpaceToken.sol";
import "./NameSpaceTokenBroker.sol";

contract NameSpaceNFT is ERC721URIStorage, NameSpaceTokenBroker {
    uint256 private s_tokenId;

    mapping(uint256 tokenId => string) private s_tokenMetas;
    mapping(bytes32 text => bool) private s_check;

    error NameSpaceUsed();
    error NotEnoughTokens(uint256 required, uint256 balance);

    constructor(address tokenAddress_, uint256 shortPenalty, uint256 longPenalty)
        ERC721("NameSpace", "NAS")
        NameSpaceTokenBroker(tokenAddress_, shortPenalty, longPenalty)
        payable
    {
        s_tokenId = 1;
    }

    function mintNFT(address recipient, string memory strValue, string memory _tokenURI)
        public
        returns (uint256 _tokenId)
    {
        // Check if the strValue has already been minted
        if (s_check[keccak256(bytes(strValue))]) {
            revert NameSpaceUsed();
        }

        s_check[keccak256(bytes(strValue))] = true;

        _tokenId = s_tokenId;

        // Calculate cost of minting the NFT
        uint256 tokenCost = getTokenCost(bytes(strValue));

        // Ensure that user has enough tokens
        uint256 recipientBalance = NameSpaceToken(tokenAddress()).balanceOf(recipient);
        if (recipientBalance < tokenCost) {
            revert NotEnoughTokens(tokenCost, recipientBalance);
        }

        // Burning the token to mint the NFT
        NameSpaceToken(tokenAddress()).tokenBurnedForNftMinting(tokenCost, _tokenId, recipient, string(strValue));

        // Storing metadata of the NFT
        s_tokenMetas[_tokenId] = strValue;

        // Mint the NFT for the user
        _safeMint(recipient, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        s_tokenId++;
    }

    function isAvailable(string memory strValue) public view returns (bool) {
        return !s_check[keccak256(bytes(strValue))];
    }

    function getTokenId() public view returns (uint256) {
        return s_tokenId;
    }

    function getTokenMetas(uint256 tokenId) public view returns (string memory) {
        return s_tokenMetas[tokenId];
    }

    function checkToken(bytes32 text) public view returns (bool) {
        return s_check[text];
    }
}
