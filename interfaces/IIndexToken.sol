// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental "ABIEncoderV2";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IIndexToken
 * @author Steady Index Protocol
 *
 * Interface for operating with SetTokens.
 */
interface IIndexToken is IERC20 {
    /* ============ Structs ============ */

    /**
     * @param component              address of token in positon
     * @param uint                   the unit value in position
     */
    struct Position {
        address component;
        uint256 unit;
        uint256 strategicUnit;
    }

    /**
     * @param unit             value of a components' default position (when initail)
     * @param strategicUnit    value of a components' ratio in strategic which sum of all component == 100e18
     */
    struct ComponentPosition {
        uint256 unit;
        uint256 strategicUnit;
    }

    /* ============ Functions ============ */

    function addComponent(address _component) external;
    function removeComponent(address _component) external;
    function editDefaultPositionUnit(address _component, uint256 _unit) external;
    function mint(address _account, uint256 _quantity) external;
    function burn(address _account, uint256 _quantity) external;
    function lock() external;
    function unlock() external;
    function setManager(address _manager) external;
    function getComponents() external view returns (address[] memory);
    function isComponent(address _component) external view returns (bool);
    function getPositionUnit(address _component) external view returns (uint256);
    function getPositionStrategicUnit(address _component) external view returns (uint256);
    function getPositions() external view returns (Position[] memory);
    function getComponentsForIndex(uint256 _amount) external view returns (address[] memory, uint256[] memory);
}
