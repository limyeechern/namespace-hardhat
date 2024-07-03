// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "./NameSpaceToken.sol";

import "./Utils.sol";

contract NameSpaceTokenBroker {
    uint256 private immutable i_shortPenalty;
    uint256 private immutable i_longPenalty;
    address private immutable i_tokenAddress;
    uint8 immutable i_decimals;

    constructor(
        address _tokenAddress,
        uint256 shortPenalty,
        uint256 longPenalty
    ) payable {
        i_tokenAddress = _tokenAddress;
        i_shortPenalty = shortPenalty;
        i_longPenalty = longPenalty;
        i_decimals = NameSpaceToken(tokenAddress()).decimals();
    }

    function tokenAddress() public view returns (address) {
        return i_tokenAddress;
    }

    function getTokenCurrentSupply() internal view returns (uint256) {
        return NameSpaceToken(tokenAddress()).getCurrentTokenSupply();
    }

    function getTokenInitialSupply() internal view returns (uint256) {
        return NameSpaceToken(tokenAddress()).getInitialTokenSupply();
    }

    function getPenalty() internal view returns (uint256 short, uint256 long) {
        // Calculate penalty factor
        uint256 penaltyFactor = ((getTokenInitialSupply() * i_decimals) /
            max(getTokenCurrentSupply(), 1));

        // Calculate penalties
        short = (penaltyFactor * i_shortPenalty) / i_decimals;
        long = (penaltyFactor * i_longPenalty) / i_decimals;
    }

    function getTokenCost(bytes memory strValue)
        public
        view
        returns (uint256 cost)
    {
        (uint256 shortPenalty, uint256 longPenalty) = getPenalty();

        uint256 lengthOfStrValue = strValue.length;

        // Prevent division by zero
        require(
            lengthOfStrValue > 0,
            "String length must be greater than zero"
        );

        cost =
            ((i_decimals / lengthOfStrValue) *
                shortPenalty +
                (i_decimals * lengthOfStrValue * longPenalty)) /
            i_decimals;
        cost = convertDecimals(cost, i_decimals);
    }
}
