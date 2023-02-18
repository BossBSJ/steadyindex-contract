pragma solidity ^0.8.0;
pragma experimental "ABIEncoderV2";

interface IDCAManager {
    struct Investment {
        address trusted;
        address tokenIn;
        address indexTokenAddr;
        uint256 startBlock;
        uint256 cycle;
    }

    function givedAllowance(address _account, address _tokenAddr)
        external
        view
        returns (uint256);

    function subscript(
        address _trustedAddr,
        address _indexTokenAddr,
        uint256 _indexTokenAmount,
        address _tokenIn,
        uint256 _cycle
    ) external;

    function buyFor(
        address _investor,
        uint256 _investmentId,
        uint256 _indexTokenAmount
    ) external;
}
