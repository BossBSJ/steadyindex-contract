pragma solidity ^0.8.0;
pragma experimental "ABIEncoderV2";
import {IController} from "../interfaces/IController.sol";

interface IDCAManager {
    struct Investment {
        address trusted;
        address tokenIn;
        address indexTokenAddr;
        uint256 lastBuy;
        uint256 cycle;
    }

    function givedAllowance(address _account, address _tokenAddr)
        external
        view
        returns (uint256);

    function subscription(
        address _trustedAddr,
        address _indexTokenAddr,
        uint256 _indexTokenAmount,
        address _tokenIn,
        uint256 _cycle
    ) external;

    function unsubscription(uint256 _investmentId) external;

    function buyFor(
        address _investor,
        uint256 _investmentId,
        uint256 _indexTokenAmount
    ) external;
}
