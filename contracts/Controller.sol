// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IMultiAssetSwapper} from "../interfaces/IMultiAssetSwapper.sol";
import {IIndexToken} from "../interfaces/IIndexToken.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IJoeRouter02} from "@traderjoe-xyz/core/contracts/traderjoe/interfaces/IJoeRouter02.sol";

import "hardhat/console.sol";

contract Controller {
    using SafeMath for uint256;
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

    uint256 private feeMultiplier;
    uint256 private feeDivider;

    /* ============ Functions ============ */
    constructor() {
        admin = msg.sender;
    }

    /* ============ External Functions ============ */

    function initialize(
        address _indexTokenFactory,
        IMultiAssetSwapper _multiAssetSwaper,
        uint256 _feeMultiplier,
        uint256 _feeDivider
    ) external onlyAdmin {
        indexTokenFactory = _indexTokenFactory;
        multiAssetSwaper = _multiAssetSwaper;
        feeMultiplier = _feeMultiplier;
        feeDivider = _feeDivider;
    }

    function issueIndexToken(
        address _indexToken,
        uint256 _indexTokenAmount,
        address _tokenIn,
        address _to
    ) external {
        require(isIndex[_indexToken], "Index doesn't exists");
        IIndexToken indexToken = IIndexToken(_indexToken);
        IERC20 tokenIn = IERC20(_tokenIn);
        (
            uint256 tokenInAmount,
            address[] memory tokenOuts,
            uint256[] memory amountOuts
        ) = getAmountInForIndexToken(_indexToken, _indexTokenAmount, _tokenIn);
        require(
            tokenIn.transferFrom(msg.sender, address(this), tokenInAmount),
            "Failed to transfer tokens"
        );

        console.log(
            "Balance in controller: %s",
            tokenIn.balanceOf(address(this))
        );

        _approveTokenForSpender(
            _tokenIn,
            address(multiAssetSwaper),
            tokenInAmount
        );

        multiAssetSwaper.swapTokenForMultiTokens(
            _tokenIn,
            tokenInAmount,
            amountOuts,
            tokenOuts,
            _indexToken
        );

        indexToken.mint(_to, _indexTokenAmount);
    }

    function redeemIndexToken(
        address _indexToken,
        uint256 _indexTokenAmount,
        address _tokenOut,
        uint256 _minAmountOut,
        address _to
    ) external {
        console.log();
        console.log("redeemIndexToken");
        IIndexToken indexToken = IIndexToken(_indexToken);
        require(isIndex[_indexToken], "Index doesn't exists");
        require(
            indexToken.allowance(msg.sender, address(this)) >=
                _indexTokenAmount,
            "Insufficient allowance"
        );
        indexToken.transferFrom(msg.sender, address(this), _indexTokenAmount);
        indexToken.burn(address(this), _indexTokenAmount);

        address[] memory components = indexToken.getComponents();
        uint256[] memory amountIns = new uint256[](components.length);
        for (uint256 i = 0; i < components.length; i++) {
            amountIns[i] = IERC20(components[i]).balanceOf(address(this));
            console.log("%s : %s", i, amountIns[i]);
        }

        for (uint256 i = 0; i < components.length; i++) {
            _approveTokenForSpender(
                components[i],
                address(multiAssetSwaper),
                amountIns[i]
            );
        }

        multiAssetSwaper.swapMultiTokensForToken(
            components,
            amountIns,
            _minAmountOut,
            _tokenOut,
            _to
        );
    }

    function setAdmin(address _admin) external onlyAdmin {
        address _oldAdmin = admin;
        admin = _admin;

        emit AdminEdited(admin, _oldAdmin);
    }

    function addIndex(address _indexToken) external onlySystem {
        isIndex[_indexToken] = true;
    }

    function getAmountInForIndexToken(
        address _indexToken,
        uint256 _indexTokenAmount,
        address _tokenIn
    )
        public
        view
        returns (
            uint256 tokenInAmount,
            address[] memory tokenOuts,
            uint256[] memory amountOuts
        )
    {
        IIndexToken indexToken = IIndexToken(_indexToken);
        (tokenOuts, amountOuts) = indexToken.getComponentsForIndex(
            _indexTokenAmount
        );

        address WAVAX_ADDRESS = multiAssetSwaper.WAVAX_ADDRESS();
        IJoeRouter02 router = IJoeRouter02(multiAssetSwaper.router());

        address[] memory path = new address[](2);
        uint256 amountWrap = 0;

        for (uint256 i = 0; i < tokenOuts.length; i++) {
            if (tokenOuts[i] == WAVAX_ADDRESS) {
                amountWrap += amountOuts[i];
            } else {
                path[0] = WAVAX_ADDRESS;
                path[1] = tokenOuts[i];

                uint256[] memory amountIns = router.getAmountsIn(
                    amountOuts[i],
                    path
                );

                uint256 amountIn = amountIns[0];
                amountWrap += amountIn;
            }
        }
        path[0] = _tokenIn;
        path[1] = WAVAX_ADDRESS;
        uint256 _tokenInAmount = router.getAmountsIn(amountWrap, path)[0];
        tokenInAmount = _tokenInAmount.add(
            _tokenInAmount.mul(feeMultiplier).div(feeDivider)
        );
    }

    function getFee()
        external
        view
        returns (uint256 _feeMultiplier, uint256 _feeDivider)
    {
        _feeMultiplier = feeMultiplier;
        _feeDivider = feeDivider;
    }

    /* ============ Internal Functions ============ */

    function _approveTokenForSpender(
        address _token,
        address _spender,
        uint256 _amount
    ) private {
        IERC20 token = IERC20(_token);
        require(
            token.approve(_spender, _amount),
            "Failed to approve token for spender"
        );
    }

    function _validateOnlyAdmin() internal view {
        require(msg.sender == admin, "Only admin can call");
    }

    function _validateOnlySystemContract() internal view {
        require(msg.sender == indexTokenFactory, "Only system can call");
    }
}
