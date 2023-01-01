// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {IMultiAssetSwapper} from "../interfaces/IMultiAssetSwapper.sol";
import {IIndexToken} from "../interfaces/IIndexToken.sol";

contract Controller {
    /* ============ Events ============ */

    event AdminEdited(address _admin, address _oldAdmin);
    event IssueIndexToken(address _indexToken, int256 _quantity, int256 _cost);

    /* ============ Modifier ============ */

    modifier onlyAdmin() {
        _validateOnlyAdmin();
        _;
    }

    modifier onlySystem() {
        _validateOnlySystemContract();
        _;
    }

    /* ============ State Variables ============ */

    IMultiAssetSwapper public multiAssetSwaper;

    address public admin;

    address public indexTokenFactory;

    mapping(address => bool) isIndex;

    /* ============ Functions ============ */
    constructor() public {
        admin = msg.sender;
    }

    /* ============ External Functions ============ */

    function initialize(
        address _indexTokenFactory,
        IMultiAssetSwapper _multiAssetSwaper
    ) external {
        indexTokenFactory = _indexTokenFactory;
        multiAssetSwaper = _multiAssetSwaper;
    }

    function issueIndexToken(IIndexToken _indexToken, uint256 _amount)
        external
        payable
    {
        _indexToken.mint(msg.sender, _amount);
    }

    function redeemIndexToken(IIndexToken _indexToken, uint256 _amount)
        external
    {
        require(isIndex[address(_indexToken)], "Index doesn't exists");
        // require(_indexToken.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");

        _indexToken.transferFrom(msg.sender, address(this), _amount);
        _indexToken.burn(address(this), _amount);
    }

    function setAdmin(address _admin) external onlyAdmin {
        address _oldAdmin = admin;
        admin = _admin;

        emit AdminEdited(admin, _oldAdmin);
    }

    function addIndex(address _indexToken) external onlySystem {
        isIndex[_indexToken] = true;
    }

    /* ============ Internal Functions ============ */

    function _validateOnlyAdmin() internal view {
        require(msg.sender == admin, "Only admin can call");
    }

    function _validateOnlySystemContract() internal view {
        require(msg.sender == indexTokenFactory, "Only system can call");
    }
}
