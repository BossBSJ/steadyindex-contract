// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;
pragma experimental "ABIEncoderV2";

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {SignedSafeMath} from "@openzeppelin/contracts/utils/math/SignedSafeMath.sol";
import {IIndexToken} from "../interfaces/IIndexToken.sol";
import {PreciseUnitMath} from "../libs/PreciseUnitMath.sol";
import {AddressArrayUtils} from "../libs/AddressArrayUtils.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

/**
 * @title IndexToken
 * @author Steady Index Protocol
 *
 * ERC20 Token contract that allows privileged modules to make modifications to its positions and invoke function calls
 * from the IndexToken.
 */
contract IndexToken is ERC20 {
    using SafeMath for uint256;
    using SafeCast for int256;
    using SafeCast for uint256;
    using SignedSafeMath for int256;
    using SignedSafeMath for uint256;
    using PreciseUnitMath for int256;
    using PreciseUnitMath for uint256;
    using Address for address;
    using AddressArrayUtils for address[];

    /* ============ Event ============ */

    event Invoked(
        address indexed _target,
        uint256 indexed _value,
        bytes _data,
        bytes _returnValue
    );
    event ManagerEdited(address _newManager, address _oldManager);
    event PositionUnitEdited(address _component, uint256 _unit);
    event ComponentAdded(address indexed _component);
    event ComponentRemoved(address indexed _component);
    event LockEdited(bool _isLock);

    /* ============ Modifier ============ */

    modifier onlyManager() {
        _validateOnlyManager();
        _;
    }

    modifier onlyController() {
        _validateOnlyController();
        _;
    }

    modifier whenUnlock() {
        _validateIsLock();
        _;
    }

    /* ============ State Variables ============ */

    // the address who can manage this Index
    address public manager;

    // the address of controller contract which can mint-burn and rebalance the ascontroller can callset
    address public controller;

    // List of tokenAddr which is represented by this token, will call components
    address[] public components;

    // the multiplier apply when init Index token at a price and will set start is 1e18
    int256 public positionMultiplier;

    // position of each components
    mapping(address => IIndexToken.ComponentPosition)
        private componentPositions;

    // if it lock will be pause to mint/burn
    bool public isLocked;

    uint256 public startBlock;

    constructor(
        address[] memory _components,
        uint256[] memory _units,
        uint256[] memory _strategicUnit,
        address _manager,
        string memory _name,
        string memory _symbol,
        address _controller
    ) public ERC20(_name, _symbol) {
        manager = _manager;
        components = _components;
        controller = _controller;
        positionMultiplier = PreciseUnitMath.preciseUnitInt();
        startBlock = block.number;

        int256 sum = 0;
        for (uint256 i = 0; i < _strategicUnit.length; i++) {
            sum += int256(_strategicUnit[i]);
        }

        require(
            sum == PreciseUnitMath.preciseUnitInt().mul(100),
            "invalid strategicUnit"
        );

        require(
            _components.length == _units.length,
            "Component not match with unit"
        );

        for (uint256 i = 0; i < _components.length; i++) {
            address component = _components[i];
            componentPositions[component].unit = _units[i];
            componentPositions[component].strategicUnit = _strategicUnit[i];
        }
    }

    /* ============ External Functions ============ */

    // /**
    //  * PRIVELEGED CONTROLLER FUNCTION. Low level function that allows a module to make an arbitrary function
    //  * call to any contract.
    //  *
    //  * @param _target                 Address of the smart contract to call
    //  * @param _value                  Quantity of Ether to provide the call (typically 0)
    //  * @param _data                   Encoded function selector and arguments
    //  * @return _returnValue           Bytes encoded return value
    //  */
    // function invoke(
    //     address _target,
    //     uint256 _value,
    //     bytes calldata _data
    // ) external onlyController returns (bytes memory _returnValue) {
    //     _returnValue = _target.functionCallWithValue(_data, _value);

    //     emit Invoked(_target, _value, _data, _returnValue);

    //     return _returnValue;
    // }

    /**
     * PRIVELEGED MANAGER FUNCTION. Low level function that adds a component to the components array.
     */
    function addComponent(address _component) external onlyManager {
        require(!isComponent(_component), "Must not be component");

        components.push(_component);

        emit ComponentAdded(_component);
    }

    /**
     * PRIVELEGED MANAGER FUNCTION. Low level function that removes a component from the components array.
     */
    function removeComponent(address _component) external onlyManager {
        components.removeStorage(_component);

        emit ComponentRemoved(_component);
    }

    /**
     * PRIVELEGED MANAGER FUNCTION. Low level function that edits a component's virtual unit. Takes a real unit
     * and converts it to virtual before committing.
     */
    function editDefaultPositionUnit(address _component, uint256 _uit)
        external
        onlyManager
    {
        componentPositions[_component].unit = _uit;

        emit PositionUnitEdited(_component, _uit);
    }

    /**
     * PRIVELEGED MANAGER FUNCTION. Increases the "account" balance by the "quantity".
     */
    function mint(address _account, uint256 _quantity)
        external
        onlyController
        whenUnlock
    {
        _mint(_account, _quantity);
    }

    /**
     * PRIVELEGED MANAGER FUNCTION. Decreases the "account" balance by the "quantity".
     * _burn checks that the "account" already has the required "quantity".
     */
    function burn(address _account, uint256 _quantity)
        external
        onlyController
        whenUnlock
    {
        (
            address[] memory componentAddrs,
            uint256[] memory units
        ) = getComponentsForIndex(_quantity);

        for (uint256 i = 0; i < componentAddrs.length; i++) {
            require(
                IERC20(componentAddrs[i]).transfer(_account, units[i]),
                "Failed to transfer"
            );
        }

        _burn(_account, _quantity);
    }

    /**
     * PRIVELEGED MANAGER FUNCTION. When a IndexToken is locked, only the locker can call privileged functions.
     */
    function lock() external onlyManager {
        require(!isLocked, "Currently was lock");
        isLocked = true;

        emit LockEdited(isLocked);
    }

    /**
     * PRIVELEGED MANAGER FUNCTION. Unlocks the IndexToken and clears the locker
     */
    function unlock() external onlyManager {
        require(isLocked, "Must be locked");
        isLocked = false;

        emit LockEdited(isLocked);
    }

    /**
     * PRIVELEGED MANAGER FUNCTION. Set new manager
     */

    function setManager(address _manager) external onlyManager whenUnlock {
        address oldManager = manager;
        manager = _manager;

        emit ManagerEdited(_manager, oldManager);
    }

    /* ============ External Getter Functions ============ */

    function getComponents() external view returns (address[] memory) {
        return components;
    }

    function isComponent(address _component) public view returns (bool) {
        return components.contains(_component);
    }

    function getPostionUnit(address _component) public view returns (uint256) {
        return _positionUnit(_component);
    }

    function getAllPositionUnit() external view returns (uint256) {
        return _getAllUnit();
    }

    function getPositionRatio(address _component) public view returns (int256) {
        int256 allUnit = int256(_getAllUnit());
        return
            int256(_positionUnit(_component)).conservativePreciseDiv(allUnit);
    }

    function getPositions()
        public
        view
        returns (IIndexToken.Position[] memory)
    {
        IIndexToken.Position[] memory positions = new IIndexToken.Position[](
            _getPositionCount()
        );

        uint256 positionCount = 0;
        for (uint256 i = 0; i < components.length; i++) {
            address component = components[i];

            if (_positionUnit(component) > 0) {
                positions[positionCount] = IIndexToken.Position({
                    component: component,
                    unit: getPostionUnit(component),
                    ratio: getPositionRatio(component)
                });
                positionCount++;
            }
        }

        return positions;
    }

    function getComponentsForIndex(uint256 _amount)
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        IIndexToken.Position[] memory positions = getPositions();

        address[] memory componentAddrs = new address[](positions.length);
        uint256[] memory unitNeeds = new uint256[](positions.length);
        for (uint256 i = 0; i < positions.length; i++) {
            componentAddrs[i] = positions[i].component;
            unitNeeds[i] = _amount.preciseMul(positions[i].unit);
        }

        return (componentAddrs, unitNeeds);
    }

    /* ============ Internal Functions ============ */
    function _positionUnit(address _component) internal view returns (uint256) {
        return componentPositions[_component].unit;
    }

    function _getAllUnit() internal view returns (uint256) {
        uint256 totalUnit = 0;
        for (uint256 i = 0; i < components.length; i++) {
            totalUnit += componentPositions[components[i]].unit;
        }
        return totalUnit;
    }

    function _getPositionCount() internal view returns (uint256) {
        uint256 positionCount = 0;
        for (uint256 i = 0; i < components.length; i++) {
            if (_positionUnit(components[i]) > 0) {
                positionCount++;
            }
        }

        return positionCount;
    }

    function _validateOnlyManager() internal view {
        require(msg.sender == manager, "Only manager can call");
    }

    function _validateOnlyController() internal view {
        require(msg.sender == controller, "Only controller can call");
    }

    function _validateIsLock() internal view {
        require(
            !isLocked,
            "This index is currently loked, only manger can config"
        );
    }
}
