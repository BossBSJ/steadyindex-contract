pragma solidity ^0.8.0;

import "hardhat/console.sol";

import {IMultiAssetSwapper} from "../interfaces/IMultiAssetSwapper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

// uniswapRouter 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
// weth 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6

contract MultiAssetSwapper is IMultiAssetSwapper {
    /* ============ Modifier ============ */
    modifier onlyAdmin() {
        _validateOnlyAdmin();
        _;
    }

    /* ============ State Variables ============ */
    address public admin;
    IUniswapV2Router02 public router;
    address public WRAP_NATIVE_ADDR;

    /* ============ Functions ============ */

    constructor(address _uniswapRouter, address _wethAddr) {
        admin = msg.sender;
        router = IUniswapV2Router02(_uniswapRouter);
        WRAP_NATIVE_ADDR = _wethAddr;
    }

    /* ============ External Functions ============ */
    function swapMultiTokensForToken(
        address[] memory _tokenIns,
        uint256[] memory _amountIns,
        uint256 _minAmountOut,
        address _tokenOut,
        address _receiver
    ) public payable {
        require(
            _tokenIns.length == _amountIns.length,
            "Invalid input parameters"
        );

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _tokenIns.length; i++) {
            IERC20 token = IERC20(_tokenIns[i]);
            uint256 allowance = token.allowance(msg.sender, address(this));
            require(allowance >= _amountIns[i], "Insufficient token allowance");

            totalAmount += _amountIns[i];
            require(
                token.transferFrom(msg.sender, address(this), _amountIns[i]),
                "Failed to transfer tokens, tokenIns"
            );
        }

        for (uint256 i = 0; i < _tokenIns.length; i++) {
            _approveTokenForSpender(
                _tokenIns[i],
                address(router),
                _amountIns[i]
            );
        }

        address[] memory path = new address[](3);
        uint256 amountOut = 0;
        for (uint256 i = 0; i < _tokenIns.length; i++) {
            path[0] = _tokenIns[i];
            path[1] = WRAP_NATIVE_ADDR;
            path[2] = _tokenOut;

            uint256 receivedAmount = router.swapExactTokensForTokens(
                _amountIns[i],
                0,
                path,
                _receiver,
                block.timestamp + 60
            )[1];

            require(
                receivedAmount > 0,
                "Invalid received amount, Swap tokenIn"
            );

            amountOut += receivedAmount;
        }
        require(amountOut > _minAmountOut, "Invalid amount out");
    }

    function swapTokenForMultiTokens(
        address _tokenIn,
        uint256 _amountIn,
        uint256[] memory _amountOuts,
        address[] memory _tokenOuts,
        address _receiver
    ) public payable {
        // Check parameter
        require(
            _tokenOuts.length == _amountOuts.length,
            "Invalid input parameters"
        );

        //  Check tokenIn allowance
        IERC20 tokenIn = IERC20(_tokenIn);
        // uint256 allowance = tokenIn.allowance(msg.sender, address(this));
        // require(allowance >= amountTokenIn, "Insufficient token allowance");

        // Transfer tokenIn to this contract
        require(
            tokenIn.transferFrom(msg.sender, address(this), _amountIn),
            "Failed to transfer tokens, tokenIn"
        );

        console.log(
            "Balance in multiSwap: %s",
            tokenIn.balanceOf(address(this))
        );

        // Approve tokenIn for uniswap
        _approveTokenForSpender(_tokenIn, address(router), _amountIn);

        // Swap tokenIn to tokenOuts
        address[] memory path = new address[](3);
        uint256 totalAmountInUsed = 0;
        path[0] = _tokenIn;
        path[1] = WRAP_NATIVE_ADDR;
        console.log("");
        for (uint256 i = 0; i < _tokenOuts.length; i++) {
            console.log(
                "Swaping %s, balance: %s",
                i,
                tokenIn.balanceOf(address(this))
            );
            path[2] = _tokenOuts[i];

            console.log(
                "Calculate will use: %s",
                router.getAmountsIn(_amountOuts[i], path)[0]
            );
            console.log(
                "Calculate ETH use: %s",
                router.getAmountsIn(_amountOuts[i], path)[1]
            );

            uint256 amountInUsed = router.swapTokensForExactTokens(
                _amountOuts[i],
                _amountIn,
                path,
                _receiver,
                block.timestamp + 60
            )[0];
            console.log("swaped %s with use %s", i, amountInUsed);
            totalAmountInUsed += amountInUsed;
            console.log("");
        }
        console.log("balance: %s", _amountIn - totalAmountInUsed);
        require(_amountIn >= totalAmountInUsed, "Invalid amount in");
    }

    function withdrawToken(address _token, uint256 _amount) public onlyAdmin {
        IERC20 token = IERC20(_token);
        require(
            token.transfer(msg.sender, _amount),
            "Failed to withdraw tokens"
        );
    }

    function withdrawEth(uint256 _amount) public onlyAdmin {
        payable(msg.sender).transfer(_amount);
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
}
