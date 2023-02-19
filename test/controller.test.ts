import hre from "hardhat";
import { MyAddr, toE18, avalanche } from "../constant";
import { Controller, IJoeRouter02, IUniswapV2Router02, IndexToken } from "../typechain-types";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { centralFixture } from "./shares/fixtures";

const {tokenA, tokenB, tokenC, wavax} = avalanche

describe("Controller", () => {
  let firstIndex: IndexToken;
  let controller: Controller;
  let deployer: SignerWithAddress;
  let router: IJoeRouter02;

  const components = {
    A: { addr: tokenA, unit: 25e6 },
    B: { addr: tokenB, unit: 75e6 },
  };

  const issueIndexToken = async () => {
    const { addrApproveTokenForSpender } = await centralFixture();
    const [wethAmountIn1, wethAmountIn2] = await Promise.all([
      (
        await router.getAmountsIn(components.A.unit, [wavax, tokenA])
      )[0],
      (
        await router.getAmountsIn(components.B.unit, [wavax, tokenB])
      )[0],
    ]);
    const _amountIn = (
      await router.getAmountsIn(wethAmountIn1.add(wethAmountIn2), [
        tokenC,
        wavax,
      ])
    )[0];
    const amountIn = _amountIn.add(_amountIn.div(400));

    // console.log("Expect to use: ", amountIn.toString());

    await addrApproveTokenForSpender(
      tokenC,
      controller.address,
      amountIn.toString()
    );

    await controller.issueIndexToken(
      firstIndex.address,
      toE18(1),
      tokenC,
      deployer.address
    );

    return { amountIn };
  };

  before(async () => {
    const fixture = await centralFixture();
    await fixture.autoSwapIfNoBalance()
    deployer = fixture.deployer;
    router = fixture.router;
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
      [toE18(25), toE18(75)],
      MyAddr,
      "FirstIndex",
      "IDX"
    );
    firstIndex = await hre.ethers.getContractAt(
      "IndexToken",
      await indexTokenFactory.indexTokens(0)
    );
  });

  it("issueIndexToken", async () => {
    const { getTokensBalanceOf } = await centralFixture();

    const [_tokenCBal, _firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      firstIndex.address,
    ]);
    console.log(_tokenCBal, _firstIdxBal)

    const { amountIn } = await issueIndexToken();

    const [tokenCBal, firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      firstIndex.address,
    ]);

    expect(tokenCBal, "tokenC balance").to.equal(_tokenCBal.sub(amountIn));
    expect(firstIdxBal, "firstIndex balance").to.equal(
      _firstIdxBal.add(toE18(1))
    );
  });

  it("redeemIndexToken all balance", async () => {
    const { getTokensBalanceOf, addrApproveTokenForSpender } =
      await centralFixture();

    await issueIndexToken();
    
    const [_tokenCBal, _firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      firstIndex.address,
    ]);

    await addrApproveTokenForSpender(  
      firstIndex.address,
      controller.address,
      _firstIdxBal.toString()
    );

    await controller.redeemIndexToken(
      firstIndex.address,
      _firstIdxBal,
      tokenC,
      0,
      deployer.address
    );

    const [tokenCBal, firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      firstIndex.address,
    ]);

    expect(firstIdxBal, "firstIndex balance ").to.equal("0");
    console.log(tokenCBal);
    expect(tokenCBal, "tokenC balance").to.greaterThan(_tokenCBal);
  });

  it("redeemIndexToken half balance", async () => {
    const { getTokensBalanceOf, addrApproveTokenForSpender } =
      await centralFixture();

    await issueIndexToken();
    const [_tokenCBal, _firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      firstIndex.address,
    ]);

    await addrApproveTokenForSpender(
      firstIndex.address,
      controller.address,
      _firstIdxBal.toString()
    );

    await controller.redeemIndexToken(
      firstIndex.address,
      _firstIdxBal.div(2),
      tokenC,
      0,
      deployer.address
    );

    const [tokenCBal, firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      firstIndex.address,
    ]);

    expect(firstIdxBal, "firstIndex balance ").to.equal(_firstIdxBal.div(2));
    expect(tokenCBal, "tokenC balance").to.greaterThan(_tokenCBal);
  });
});
