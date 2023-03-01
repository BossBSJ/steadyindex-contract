import hre from "hardhat";
import { MyAddr, toE18, avalanche } from "../constant";
import { Controller, IJoeRouter02, IndexToken } from "../typechain-types";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { centralFixture } from "./shares/fixtures";

const { tokenA, tokenB, tokenC, wavax } = avalanche;

describe("Controller", () => {
  let firstIndex: IndexToken;
  let WAVAXIndex: IndexToken;
  let controller: Controller;
  let deployer: SignerWithAddress;
  let router: IJoeRouter02;

  const components = {
    A: { addr: tokenA, unit: 25e6 },
    B: { addr: tokenB, unit: 75e6 },
  };

  const issueFirstIndexToken = async () => {
    const { addrApproveTokenForSpender } = await centralFixture();
    const [wethAmountIn1, wethAmountIn2] = await Promise.all([
      (await router.getAmountsIn(components.A.unit, [wavax, tokenA]))[0],
      (await router.getAmountsIn(components.B.unit, [wavax, tokenB]))[0],
    ]);
    const _amountIn = (
      await router.getAmountsIn(wethAmountIn1.add(wethAmountIn2), [
        tokenC,
        wavax,
      ])
    )[0];
    const amountIn = _amountIn.add(_amountIn.div(400));

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

  const issueWAVAXIndexToken = async () => {
    const { addrApproveTokenForSpender } = await centralFixture();
    const components = await WAVAXIndex.getPositions();
    const wavaxAmounts = await Promise.all(
      components
        .filter((comp) => comp.component.toLowerCase() != wavax.toLowerCase())
        .map(
          async (comp) =>
            (
              await router.getAmountsIn(comp.unit, [wavax, comp.component])
            )[0]
        )
    );

    const wavaxSumAmount = [
      ...wavaxAmounts,
      ...components
        .filter((comp) => comp.component == wavax)
        .map((comp) => comp.unit),
    ].reduce((accum, current) => accum.add(current));

    const _amountIn = (
      await router.getAmountsIn(wavaxSumAmount, [tokenC, wavax])
    )[0];
    const amountIn = _amountIn.add(_amountIn.div(400));

    await addrApproveTokenForSpender(
      tokenC,
      controller.address,
      amountIn.toString()
    );

    await controller.issueIndexToken(
      WAVAXIndex.address,
      toE18(1),
      tokenC,
      deployer.address
    );

    return { amountIn };
  };

  beforeEach(async () => {
    const fixture = await centralFixture();
    await fixture.autoSwapIfNoBalance();
    deployer = fixture.deployer;
    router = fixture.router;
    controller = fixture.controller;

    await fixture.initController();

    firstIndex = await fixture.createDefaultIndex();
    WAVAXIndex = await fixture.createWAVAXIndex();
  });

  it("issueFirstIndexToken", async () => {
    const { getTokensBalanceOf } = await centralFixture();

    const [_tokenCBal, _firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      firstIndex.address,
    ]);

    const { amountIn } = await issueFirstIndexToken();

    const [tokenCBal, firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      firstIndex.address,
    ]);

    expect(tokenCBal, "tokenC balance").to.equal(_tokenCBal.sub(amountIn));
    expect(firstIdxBal, "firstIndex balance").to.equal(
      _firstIdxBal.add(toE18(1))
    );
  });

  it("issueWAVAXIndex", async () => {
    const { getTokensBalanceOf } = await centralFixture();

    const [_tokenCBal, _firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      WAVAXIndex.address,
    ]);

    const { amountIn } = await issueWAVAXIndexToken();

    const [tokenCBal, firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      WAVAXIndex.address,
    ]);

    expect(tokenCBal, "tokenC balance").to.equal(_tokenCBal.sub(amountIn));
    expect(firstIdxBal, "WAVAXIndex balance").to.equal(
      _firstIdxBal.add(toE18(1))
    );
  });

  it("redeemIndexToken all balance", async () => {
    const { getTokensBalanceOf, addrApproveTokenForSpender } =
      await centralFixture();

    const [_tokenCBal] = await getTokensBalanceOf([tokenC]);

    const { amountIn } = await issueFirstIndexToken();

    const [_tokenCBal2, _firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      firstIndex.address,
    ]);
    expect(_tokenCBal, "check tokenCBal bf redeem").to.equal(
      _tokenCBal2.add(amountIn)
    );

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

    console.log(
      tokenCBal.toString(),
      _tokenCBal.toString(),
      _tokenCBal2.toString()
    );
    expect(firstIdxBal, "firstIndex balance ").to.equal("0");
    expect(tokenCBal, "tokenC balance").to.approximately(
      _tokenCBal,
      _tokenCBal.div(1000)
    );
  });

  it("redeemIndexToken half balance", async () => {
    const { getTokensBalanceOf, addrApproveTokenForSpender } =
      await centralFixture();

    const [_tokenCBal] = await getTokensBalanceOf([tokenC]);
    const { amountIn } = await issueFirstIndexToken();
    const [_tokenCBal2, _firstIdxBal] = await getTokensBalanceOf([
      tokenC,
      firstIndex.address,
    ]);

    expect(_tokenCBal, "check tokenCBal bf redeem").to.equal(
      _tokenCBal2.add(amountIn)
    );

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
    expect(tokenCBal, "tokenC balance").to.approximately(
      _tokenCBal.sub(amountIn.div(2)),
      _tokenCBal.sub(amountIn.div(2)).div(100)
    );
  });
});
