import hre from "hardhat";
import { avalanche } from "../../constant";
import BigNumber from "bignumber.js";

export async function centralFixture(_avalanche: typeof avalanche = avalanche) {
  const { joeRouter02, wavax, tokenA, tokenB, tokenC } = _avalanche;

  const addresses = _avalanche;
  const [deployer] = await hre.ethers.getSigners();

  const multiAssetSwapper = await (
    await hre.ethers.getContractFactory("MultiAssetSwapper")
  ).deploy(joeRouter02, wavax);

  const router = await hre.ethers.getContractAt("IJoeRouter02", joeRouter02);

  const ERC20 = await hre.ethers.getContractFactory("ERC20");

  const controller = await (
    await hre.ethers.getContractFactory("Controller")
  ).deploy();

  const indexTokenFactory = await (
    await hre.ethers.getContractFactory("IndexTokenFactory")
  ).deploy(controller.address);

  const dcaManager = await (
    await hre.ethers.getContractFactory("DCAManager")
  ).deploy(deployer.address, controller.address);

  async function initController() {
    await controller.initialize(
      indexTokenFactory.address,
      multiAssetSwapper.address
    );
  }

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
    accountAddr: string = deployer.address
  ) {
    const account = await hre.ethers.getSigner(accountAddr);
    ERC20.attach(tokenAddr).connect(account).approve(spender, amount);
  }

  async function autoSwapIfNoBalance() {
    if ((await ERC20.attach(tokenA).balanceOf(deployer.address)).isZero()) {
      router.swapExactAVAXForTokens(
        0,
        [wavax, tokenA],
        deployer.address,
        Math.floor(Date.now() / 1000) + 60 * 10,
        { value: hre.ethers.utils.parseEther("1000") }
      );
    }
    if ((await ERC20.attach(tokenB).balanceOf(deployer.address)).isZero()) {
      router.swapExactAVAXForTokens(
        0,
        [wavax, tokenB],
        deployer.address,
        Math.floor(Date.now() / 1000) + 60 * 10,
        { value: hre.ethers.utils.parseEther("1000") }
      );
    }
    if ((await ERC20.attach(tokenC).balanceOf(deployer.address)).isZero()) {
      router.swapExactAVAXForTokens(
        0,
        [wavax, tokenC],
        deployer.address,
        Math.floor(Date.now() / 1000) + 60 * 10,
        { value: hre.ethers.utils.parseEther("1000") }
      );
    }
  }

  return {
    addresses,
    deployer,
    multiAssetSwapper,
    router,
    ERC20,
    controller,
    indexTokenFactory,
    dcaManager,
    getTokensBalanceOf,
    addrApproveTokenForSpender,
    autoSwapIfNoBalance,
    initController,
  };
}
