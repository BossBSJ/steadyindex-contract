// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;
pragma experimental "ABIEncoderV2";

interface IIndexTokenFactory {
    function createIndexToken(
        address[] memory _components,
        int256[] memory _units,
        address _manager,
        string memory _name,
        string memory _symbol
    ) external returns (address);

    function getIndexs() external view returns (address[] memory);
}
