// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;
pragma experimental "ABIEncoderV2";

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {SignedSafeMath} from "@openzeppelin/contracts/utils/math/SignedSafeMath.sol";
import {IIndexToken} from "../interfaces/IIndexToken.sol";
import {PreciseUnitMath} from "../libs/PreciseUnitMath.sol";
import {AddressArrayUtils} from "../libs/AddressArrayUtils.sol";

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
    using PreciseUnitMath for int256;
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
    event PositionUnitEdited(address _component, int256 _unit);
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

    constructor(
        address[] memory _component,
        int256[] memory _units,
        address _controller,
        string memory _name,
        string memory _symbol
    ) public ERC20(_name, _symbol) {
        manager = msg.sender;
        components = _component;
        controller = _controller;
        positionMultiplier = PreciseUnitMath.preciseUnitInt();

        for (uint256 i = 0; i < _component.length; i++) {
            componentPositions[_component[i]].unit = _units[i];
        }

        require(
            _component.length == _units.length,
            "Component not match with unit"
        );
    }

    /* ============ External Functions ============ */

    function invoke(
        address _target,
        uint256 _value,
        bytes calldata _data
    ) external onlyController returns (bytes memory _returnValue) {
        _returnValue = _target.functionCallWithValue(_data, _value);

        emit Invoked(_target, _value, _data, _returnValue);

        return _returnValue;
    }

    function addComponent(address _component) external onlyManager {
        require(!isComponent(_component), "Must not be component");

        components.push(_component);

        emit ComponentAdded(_component);
    }

    function removeComponent(address _component) external onlyManager {
        components.removeStorage(_component);

        emit ComponentRemoved(_component);
    }

    function editPositionUnit(address _component, int256 _uit)
        external
        onlyManager
    {
        componentPositions[_component].unit = _uit;

        emit PositionUnitEdited(_component, _uit);
    }

    function mint(address _account, uint256 _quantity)
        external
        onlyController
        whenUnlock
    {
        _mint(_account, _quantity);
    }

    function burn(address _account, uint256 _quantity)
        external
        onlyController
        whenUnlock
    {
        _burn(_account, _quantity);
    }

    function lock() external onlyManager {
        require(!isLocked, "Currently was lock");
        isLocked = true;

        emit LockEdited(isLocked);
    }

    function unlock() external onlyManager {
        require(isLocked, "Must be locked");
        isLocked = false;

        emit LockEdited(isLocked);
    }

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

    function getPostionUnit(address _component) public view returns (int256) {
        return _positionUnit(_component);
    }

    function getAllPositionUnit() public view returns (int256) {
        return _getAllUnit();
    }

    function getPositionRatio(address _component) public view returns (int256) {
        int256 allUnit = _getAllUnit();
        return _positionUnit(_component).conservativePreciseDiv(allUnit);
    }

    function getPositions()
        external
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

    /* ============ Internal Functions ============ */
    function _positionUnit(address _component) internal view returns (int256) {
        return componentPositions[_component].unit;
    }

    function _getAllUnit() internal view returns (int256) {
        int256 totalUnit = 0;
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
