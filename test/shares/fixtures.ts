import hre from "hardhat";
import { tokenA, tokenB, uniswapRouterAddr, wethAddr } from "../constant";
import BigNumber from "bignumber.js";

export async function centralFixture() {
  const [deployer] = await hre.ethers.getSigners();

  const multiAssetSwapper = await (
    await hre.ethers.getContractFactory("MultiAssetSwapper")
  ).deploy(uniswapRouterAddr, wethAddr);

  const uniswapRouter = await hre.ethers.getContractAt(
    "IUniswapV2Router02",
    uniswapRouterAddr
  );

  const ERC20 = await hre.ethers.getContractFactory("ERC20");

  const controller = await (
    await hre.ethers.getContractFactory("Controller")
  ).deploy();

  const indexTokenFactory = await (
    await hre.ethers.getContractFactory("IndexTokenFactory")
  ).deploy(controller.address);

  async function getTokensBalanceOf(
    tokenAddrs: string[],
    accountAddr: string = deployer.address
  ) {
    return await Promise.all(
      tokenAddrs.map((tokenAddr) =>
        ERC20.attach(tokenAddr).balanceOf(accountAddr)
      )
    );
  }

  async function addrApproveTokenForSpender(
      tokenAddr: string,
      spender: string,
      amount: string,
      accountAddr: string = deployer.address,
  ) {
    const account = await hre.ethers.getSigner(accountAddr);
    ERC20.attach(tokenAddr).connect(account).approve(spender, amount);
  }

  return {
    deployer,
    multiAssetSwapper,
    uniswapRouter,
    ERC20,
    controller,
    indexTokenFactory,
    getTokensBalanceOf,
    addrApproveTokenForSpender
  };
}
