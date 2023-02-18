// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {IMultiAssetSwapper} from "../interfaces/IMultiAssetSwapper.sol";
import {IIndexToken} from "../interfaces/IIndexToken.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

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

    function issueIndexToken(
        address _indexToken,
        uint256 _indexTokenAmount,
        address _tokenIn,
        address _to
    ) external {
        IIndexToken indexToken = IIndexToken(_indexToken);
        IERC20 tokenIn = IERC20(_tokenIn);
        require(isIndex[_indexToken], "Index doesn't exists");
        (address[] memory tokenOuts, uint256[] memory amountOuts) = indexToken.getComponentsNeedForIndex(_indexTokenAmount);
        address WRAP_NATIVE_ADDR = multiAssetSwaper.WRAP_NATIVE_ADDR();
        IUniswapV2Router02 router = IUniswapV2Router02(
            multiAssetSwaper.router()
        );

        address[] memory path = new address[](2);
        uint256 amountWrap = 0;

        for (uint256 i = 0; i < tokenOuts.length; i++) {
            path[0] = WRAP_NATIVE_ADDR;
            path[1] = tokenOuts[i];

            uint256[] memory amountIns = router.getAmountsIn(
                amountOuts[i],
                path
            );

            uint256 amountIn = amountIns[0];
            amountWrap += amountIn;
        }
        path[0] = _tokenIn;
        path[1] = WRAP_NATIVE_ADDR;
        uint256 _tokenInAmount = router.getAmountsIn(amountWrap, path)[0];
        uint256 tokenInAmount = _tokenInAmount.add(_tokenInAmount.div(400));
        require(
            tokenIn.transferFrom(msg.sender, address(this), tokenInAmount),
            "Failed to transfer tokens"
        );

        console.log("Balance in controller: %s",tokenIn.balanceOf(address(this)));

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

    function redeemIndexToken(IIndexToken _indexToken, uint256 _amount)
        external
        payable
    {
        require(isIndex[address(_indexToken)], "Index doesn't exists");
        require(_indexToken.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
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
