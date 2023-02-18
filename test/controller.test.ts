import { ethers, network } from "hardhat";
import {
  MyAddr,
  tokenA,
  tokenB,
  tokenC,
  uniswapRouterAddr,
  wethAddr,
} from "./constant";
import {
  Controller,
  IUniswapV2Router02,
  IndexToken,
  SimpleToken__factory,
} from "../typechain-types";
import { expect } from "chai";
import BigNumber from "bignumber.js";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { centralFixture } from "./shares/fixtures";

describe.only("Controller", () => {
  let firstIndex: IndexToken;
  let controller: Controller;
  let deployer: SignerWithAddress;
  let uniswapRouter: IUniswapV2Router02;

  const components = {
    A: { addr: tokenA, unit: 25e10 },
    B: { addr: tokenB, unit: 75e10 },
  };

  before(async () => {
    const fixture = await centralFixture();
    deployer = fixture.deployer;
    uniswapRouter = fixture.uniswapRouter;
    controller = fixture.controller;
    const indexTokenFactory = fixture.indexTokenFactory;
    const multiAssetSwapper = fixture.multiAssetSwapper;

    await controller.initialize(
      indexTokenFactory.address,
      multiAssetSwapper.address
    );

    await indexTokenFactory.createIndexToken(
      [components.A.addr, components.B.addr],
      [components.A.unit, components.B.unit],
      [new BigNumber("25e18").toString(), new BigNumber("75e18").toString()],
      MyAddr,
      "FirstIndex",
      "IDX"
    );
    firstIndex = await ethers.getContractAt(
      "IndexToken",
      await indexTokenFactory.indexTokens(0)
    );
  });

  it("issueIndexToken", async () => {
    const { getTokensBalanceOf, addrApproveTokenForSpender } =
      await centralFixture();

    const [_tokenABal, _tokenBBal, _tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);

    const [wethAmountIn1, wethAmountIn2] = await Promise.all([
      (
        await uniswapRouter.getAmountsIn(components.A.unit, [wethAddr, tokenA])
      )[0],
      (
        await uniswapRouter.getAmountsIn(components.B.unit, [wethAddr, tokenB])
      )[0],
    ]);
    const _amountIn = (
      await uniswapRouter.getAmountsIn(wethAmountIn1.add(wethAmountIn2), [
        tokenC,
        wethAddr,
      ])
    )[0];
    const amountIn = _amountIn.add(_amountIn.div(400))

    // const c1 = await uniswapRouter.getAmountIn(
    //   wethAmountIn1,
    //   "25000000000000000000",
    //   "100000000000000"
    // );
    // const c2 = await uniswapRouter.getAmountIn(
    //   wethAmountIn2,
    //   new BigNumber("25000000000000000000").plus(c1.toString()).toString(),
    //   new BigNumber("100000000000000")
    //     .minus(wethAmountIn1.toString())
    //     .toString()
    // );

    // const cc = await uniswapRouter.getAmountIn(
    //   wethAmountIn1.add(wethAmountIn2),
    //   "25000000000000000000",
    //   "100000000000000"
    // );
    // console.log("expect tokenC use", c1.toString(), c2.toString(), cc.toString());

    console.log("Expect to use: ", amountIn.toString());

    await addrApproveTokenForSpender(
      tokenC,
      controller.address,
      amountIn.toString()
    );

    await controller.issueIndexToken(
      firstIndex.address,
      new BigNumber("1e18").toString(),
      tokenC,
      deployer.address
    );

    const [tokenABal, tokenBBal, tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);

    expect(tokenCBal, "tokenC").to.equal(_tokenCBal.sub(amountIn));
  });
});
