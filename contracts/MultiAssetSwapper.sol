pragma solidity ^0.8.0;

import "hardhat/console.sol";

import {IMultiAssetSwapper} from "../interfaces/IMultiAssetSwapper.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IJoeRouter02} from "@traderjoe-xyz/core/contracts/traderjoe/interfaces/IJoeRouter02.sol";

contract MultiAssetSwapper is IMultiAssetSwapper {
    /* ============ Modifier ============ */
    modifier onlyAdmin() {
        _validateOnlyAdmin();
        _;
    }

    /* ============ State Variables ============ */
    address public admin;
    IJoeRouter02 public router;
    address public WAVAX_ADDRESS;

    /* ============ Functions ============ */

    constructor(address _router, address _wethAddr) {
        admin = msg.sender;
        router = IJoeRouter02(_router);
        WAVAX_ADDRESS = _wethAddr;
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

        for (uint256 i = 0; i < _tokenIns.length; i++) {
            IERC20 token = IERC20(_tokenIns[i]);
            uint256 allowance = token.allowance(msg.sender, address(this));
            require(allowance >= _amountIns[i], "Insufficient token allowance");
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

        address[] memory path = new address[](2);
        uint256 wavaxAmount = 0;
        for (uint256 i = 0; i < _tokenIns.length; i++) {
            if (_tokenIns[i] == WAVAX_ADDRESS) {
                wavaxAmount += _amountIns[i];
                continue;
            }

            path[0] = _tokenIns[i];
            path[1] = WAVAX_ADDRESS;

            uint256 receivedWavaxAmount = router.swapExactTokensForTokens(
                _amountIns[i],
                0,
                path,
                address(this),
                block.timestamp + 60
            )[1];

            require(
                receivedWavaxAmount > 0,
                "Invalid received amount, Swap tokenIn"
            );

            wavaxAmount += receivedWavaxAmount;
        }

        _approveTokenForSpender(WAVAX_ADDRESS, address(router), wavaxAmount);
        
        path[0] = WAVAX_ADDRESS;
        path[1] = _tokenOut;

        uint256 receivedAmount = router.swapExactTokensForTokens(
            wavaxAmount,
            0,
            path,
            _receiver,
            block.timestamp + 60
        )[1];

        require(receivedAmount > _minAmountOut, "Invalid amount out");
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

        require(_tokenIn != WAVAX_ADDRESS, "Not allow to use WAVAX as tokenIn");

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
        path[1] = WAVAX_ADDRESS;
        console.log("");
        for (uint256 i = 0; i < _tokenOuts.length; i++) {
            path[2] = _tokenOuts[i];

            console.log(
                "Remaining balance: %s",
                IERC20(_tokenIn).balanceOf(address(this))
            );

            if (_tokenOuts[i] == WAVAX_ADDRESS) {
                address[] memory tmpPath = new address[](2);
                tmpPath[0] = path[0];
                tmpPath[1] = path[1];
                console.log("swaping... wavax");
                uint256 amountInUsed = router.swapTokensForExactTokens(
                    _amountOuts[i],
                    _amountIn,
                    tmpPath,
                    _receiver,
                    block.timestamp + 60
                )[0];
                console.log("swaped %s with use %s", i, amountInUsed);
                totalAmountInUsed += amountInUsed;
            } else if (path[2] == _tokenIn) {
                IERC20(_tokenIn).transfer(_receiver, _amountOuts[i]);
            } else {
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
            }
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
