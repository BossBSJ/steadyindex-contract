// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {IUniswapV2Pair} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import {IUniswapV2Router01} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MultiAssetSwapper {
    using SafeMath for uint256;
    using SafeCast for int256;
    using SafeCast for uint256;

    /* ============ Event ============ */
    event Swapper(
        address _indexToken,
        address[] _tokens,
        uint256[] _ethAmounts,
        uint256[] _amoutOuts
    );

    /* ============ Modifier ============ */

    modifier onlyController() {
        _validateOnlyController();
        _;
    }

    /* ============ State Variables ============ */

    IUniswapV2Router01 public router;
    address public controller;

    constructor(IUniswapV2Router01 _router, address _controller) public {
        router = _router;
        controller = _controller;
    }

    function swaper(
        address[] calldata _tokens,
        uint256[] calldata _ethAmounts,
        address[][] memory paths,
        uint256[] calldata _amountOutMins,
        address _indexToken
    ) public payable onlyController {
        // Ensure that the contract has sufficient ETH to complete the swap
        require(
            _isEthAmountsEqEthValue(_ethAmounts, msg.value),
            "ETH value mismatch"
        );

        uint256[] memory _amoutOuts = new uint256[](_tokens.length);

        // Perform the swap on Uniswap
        for (uint256 i = 0; i < _tokens.length; i++) {
            uint256[] memory resultAmounts = router.swapExactETHForTokens{
                value: msg.value
            }(
                _amountOutMins[i], // amountOutMin
                paths[i], // path
                address(this), // to
                _deadline() // deadline
            );

            // Ensure that the swap was successful
            require(
                resultAmounts[resultAmounts.length - 1] >= _amountOutMins[i],
                string.concat(
                    string("Swap failed at token address: "),
                    Strings.toHexString(uint256(uint160(_tokens[i])), 20)
                )
            );

            _amoutOuts[i] = resultAmounts[resultAmounts.length - 1];
        }

        emit Swapper(_indexToken, _tokens, _ethAmounts, _amoutOuts);
    }

    /* ============ Internal Functions ============ */

    function _deadline() private view returns (uint256) {
        return block.timestamp + 10 minutes;
    }

    function _isEthAmountsEqEthValue(
        uint256[] calldata _amounts,
        uint256 _value
    ) private pure returns (bool) {
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        return totalAmount == _value;
    }

    function _validateOnlyController() internal view {
        require(msg.sender == controller, "Only controller can call");
    }
}
