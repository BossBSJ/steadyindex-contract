// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;
pragma experimental "ABIEncoderV2";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IDCAManager} from "../interfaces/IDCAManager.sol";
import {IController} from "../interfaces/IController.sol";

import "hardhat/console.sol";

contract DCAManager is IDCAManager {
    /* ============ Modifier ============ */
    modifier onlyAdmin() {
        _validateOnlyAdmin();
        _;
    }

    /* ============ State Variables ============ */
    address public admin;
    IController public controller;
    // trustedAddr -> investorAddrs[] -- investroAddr -> invextment
    mapping(address => address[]) public investors;
    mapping(address => IDCAManager.Investment[]) public investments;

    /* ============ Functions ============ */
    constructor(address _admin, IController _controller) {
        admin = _admin;
        controller = _controller;
    }

    /* ============ External Functions ============ */
    function InvestmentsForAccount(address _investor)
        external
        view
        returns (IDCAManager.Investment[] memory)
    {
        return investments[_investor];
    }

    function givedAllowance(address _account, address _tokenAddr)
        external
        view
        returns (uint256)
    {
        return IERC20(_tokenAddr).allowance(_account, address(this));
    }

    function subscription(
        address _trustedAddr,
        address _indexTokenAddr,
        uint256 _indexTokenAmount,
        address _tokenIn,
        uint256 _tokenInAmount,
        uint256 _cycle
    ) external {
        address _investor = msg.sender;
        IDCAManager.Investment[] storage investment = investments[_investor];
        uint256 investmentId = investment.length;
        IDCAManager.Investment memory newInvestment = IDCAManager.Investment(
            _trustedAddr,
            _tokenIn,
            _tokenInAmount,
            _indexTokenAddr,
            0,
            _cycle
        );

        investment.push(newInvestment);
        buyFor(_investor, investmentId, _indexTokenAmount);
    }

    function unsubscription(uint256 _investmentId) external {
        IDCAManager.Investment[] storage investment = investments[msg.sender];
        require(investment.length > _investmentId, "Out of range Investments");
        for (uint256 i = _investmentId; i < investment.length-1; i++) {
            investment[i] = investment[i + 1];
        }
        investment.pop();

        investments[msg.sender] = investment;
    }

    function buyFor(
        address _investor,
        uint256 _investmentId,
        uint256 _indexTokenAmount
    ) public {
        IDCAManager.Investment memory investment = investments[_investor][
            _investmentId
        ];
        _validateOnlyTruste(investment.trusted);

        require(
            investment.lastBuy + investment.cycle <= block.timestamp,
            "Cycle missmatch"
        );
        if (investment.lastBuy == 0) {
            investment.lastBuy = block.timestamp;
        } else {
            investment.lastBuy = investment.lastBuy + investment.cycle;
        }
        investments[_investor][_investmentId] = investment;

        (uint256 tokenInAmount, , ) = controller.getAmountInForIndexToken(
            investment.indexTokenAddr,
            _indexTokenAmount,
            investment.tokenIn
        );

console.log("DCA tokenInAmount: %s", tokenInAmount);

        require(
            IERC20(investment.tokenIn).transferFrom(
                _investor,
                address(this),
                tokenInAmount
            ),
            "Failed to transfer to DCA manager"
        );

        _approveTokenForSpender(
            investment.tokenIn,
            address(controller),
            tokenInAmount
        );

        controller.issueIndexToken(
            investment.indexTokenAddr,
            _indexTokenAmount,
            investment.tokenIn,
            _investor
        );
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

    function _validateOnlyTruste(address trusted) internal view {
        require(msg.sender == trusted, "Only investor trusted");
    }

    function _validateOnlyAdmin() internal view {
        require(msg.sender == admin, "Only admin can call");
    }
}
