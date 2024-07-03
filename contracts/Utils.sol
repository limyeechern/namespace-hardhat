// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

function convertDecimals(uint256 value, uint8 decimals) pure returns (uint256) {
    return value * (10**decimals);
}

// Referenced optimised code from Solady
function max(uint256 x, uint256 y) pure returns (uint256 z) {
    assembly {
        z := xor(x, mul(xor(x, y), gt(y, x)))
    }
}
