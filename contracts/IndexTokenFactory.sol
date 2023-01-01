// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;
pragma experimental "ABIEncoderV2";

import {IndexToken} from "./IndexToken.sol";
import {IController} from "../interfaces/IController.sol";
import {AddressArrayUtils} from "../libs/AddressArrayUtils.sol";

contract IndexTokenFactory {
    using AddressArrayUtils for address[];

    /* ============ Events ============ */

    event IndexTokenCreated(
        address indexed _indexToken,
        address _manager,
        string _name,
        string _symbol
    );

    /* ============ State Variables ============ */

    // Instance of the controller smart contract
    IController public controller;
    address[] public indexTokens;

    constructor(IController _controller) public {
        controller = _controller;
    }

    function createIndexToken(
        address[] memory _components,
        int256[] memory _units,
        address _manager,
        string memory _name,
        string memory _symbol
    ) external returns (address) {
        require(_components.length > 0, "Must have at least 1 component");
        require(
            _components.length == _units.length,
            "Component not match with unit"
        );
        require(
            !_components.hasDuplicate(),
            "Components must not have a duplicate"
        );
        require(_manager != address(0), "Manager must not be empty");

        for (uint256 i = 0; i < _components.length; i++) {
            require(_units[i] > 0, "Units must be greater than 0");
        }

        IndexToken indexToken = new IndexToken(
            _components,
            _units,
            address(controller),
            _name,
            _symbol
        );

        address _indexToken = address(indexToken);
        indexTokens.push(_indexToken);
        controller.addIndex(_indexToken);

        emit IndexTokenCreated(_indexToken, _manager, _name, _symbol);

        return _indexToken;
    }

    function getIndexTokens() public view returns(address[] memory) {
        return indexTokens;
    }
}
