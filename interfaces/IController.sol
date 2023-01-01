// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;
pragma experimental "ABIEncoderV2";

import {IIndexToken} from "../interfaces/IIndexToken.sol";

interface IController {
    function admin() external view returns (address);
    function isIndex(address _indexToken) external view returns (bool);
    function addIndex(address _indexToken) external;
    function setAdmin(address _admin) external;

    function initialize(address _indexTokenFactory) external;
    function issueIndexToken(IIndexToken _indexToken, uint256 _amount) external payable;
    function redeemIndexToken(IIndexToken _indexToken, uint256 _amount) external;
}
