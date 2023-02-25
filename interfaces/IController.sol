// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental "ABIEncoderV2";

import {IIndexToken} from "../interfaces/IIndexToken.sol";

interface IController {
    function admin() external view returns (address);

    function isIndex(address _indexToken) external view returns (bool);

    function addIndex(address _indexToken) external;

    function setAdmin(address _admin) external;

    function initialize(address _indexTokenFactory) external;

    function issueIndexToken(
        address _indexToken,
        uint256 _indexTokenAmount,
        address _tokenIn,
        address _to
    ) external;

    function redeemIndexToken(
        address _indexToken,
        uint256 _indexTokenAmount,
        address _tokenOut,
        uint256 _minAmountOut,
        address _to
    ) external;

    function getAmountInForIndexToken(
        address _indexToken,
        uint256 _indexTokenAmount,
        address _tokenIn
    )
        external
        view
        returns (
            uint256 tokenInAmount,
            address[] memory tokenOuts,
            uint256[] memory amountOuts
        );
}
