// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;
pragma experimental "ABIEncoderV2";

import {IIndexToken} from "./IIndexToken.sol";

interface IMultiAssetSwapper {
    function router() external view returns (address);
    function controller() external view returns (address);

    function swaper(
        address[] calldata _tokens,
        int256[] calldata _ethAmounts,
        address[][] memory paths,
        uint256[] calldata _amountOutMins
    ) external payable;
}
