// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;
pragma experimental "ABIEncoderV2";

import {IIndexToken} from "./IIndexToken.sol";
import {IJoeRouter02} from "@traderjoe-xyz/core/contracts/traderjoe/interfaces/IJoeRouter02.sol";

interface IMultiAssetSwapper {
    function admin() external view returns (address);

    function router() external view returns (IJoeRouter02);

    function WAVAX_ADDRESS() external view returns (address);

    // function controller() external view returns (address);

    function swapMultiTokensForToken(
        address[] memory _tokenIns,
        uint256[] memory _amountIns,
        uint256 _minAmountOut,
        address _tokenOut,
        address _receiver
    ) external payable;

    function swapTokenForMultiTokens(
        address _tokenIn,
        uint256 _amountIn,
        uint256[] memory _amountOuts,
        address[] memory _tokenOuts,
        address _receiver
    ) external payable;

    function withdrawToken(address _token, uint256 _amount) external;
}
