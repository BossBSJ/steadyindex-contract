// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental "ABIEncoderV2";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IDCAManager} from "../interfaces/IDCAManager.sol";
import {IController} from "../interfaces/IController.sol";

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
    function givedAllowance(address _account, address _tokenAddr)
        external
        view
        returns (uint256)
    {
        return IERC20(_tokenAddr).allowance(_account, address(this));
    }

    function subscript(
        address _trustedAddr,
        address _indexTokenAddr,
        uint256 _indexTokenAmount,
        address _tokenIn,
        uint256 _cycle
    ) external {
        address _investor = msg.sender;
        IDCAManager.Investment[] storage investment = investments[_investor];
        uint256 investmentId = investment.length;
        IDCAManager.Investment memory newInvestment = IDCAManager.Investment(
            _trustedAddr,
            _tokenIn,
            _indexTokenAddr,
            block.number,
            _cycle
        );

        investment.push(newInvestment);
        buyFor(_investor, investmentId, _indexTokenAmount);
    }

    function unsubscription() public {}

    function buyFor(
        address _investor,
        uint256 _investmentId,
        uint256 _indexTokenAmount
    ) public {
        IDCAManager.Investment memory investment = investments[_investor][
            _investmentId
        ];
        _validateOnlyTruste(investment.trusted);

        (uint256 tokenInAmount, , ) = controller.getAmountInForIndexToken(
            investment.indexTokenAddr,
            _indexTokenAmount,
            investment.tokenIn
        );

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

    function sellFor() public {
        // ...
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
