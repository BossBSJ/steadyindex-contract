import { MultiAssetSwapper } from "../typechain-types/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20__factory, IJoeRouter02 } from "../typechain-types";
import { expect } from "chai";
import { avalanche } from "../constant";
import { centralFixture } from "./shares/fixtures";
import { ethers } from "ethers";

const { tokenA, tokenB, tokenC, wavax } = avalanche;

describe("MultiAssetSwapper", () => {
  let deployer: SignerWithAddress;
  let multiAssetSwapper: MultiAssetSwapper;
  let router: IJoeRouter02;
  let ERC20: ERC20__factory;

  beforeEach(async () => {
    const fixture = await centralFixture();
    await fixture.autoSwapIfNoBalance();
    deployer = fixture.deployer;
    multiAssetSwapper = fixture.multiAssetSwapper;
    router = fixture.router;
    ERC20 = fixture.ERC20;

    // Token A B C approve multiSwapAsset
    [tokenA, tokenB, tokenC].map((tokenAddr, idx) => {
      setTimeout(async () => {
        const token = ERC20.attach(tokenAddr);
        await token.approve(
          multiAssetSwapper.address,
          "100000000000000000000000"
        );
      }, idx);
    });
  });

  it("swapMultiTokensForToken", async () => {
    const { getTokensBalanceOf } = await centralFixture();

    const [_tokenABal, _tokenBBal, _tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);
    const [wavaxOutFromA, wavaxOutFromB] = await Promise.all([
      (await router.getAmountsOut(100e6, [tokenA, wavax]))[1],
      (await router.getAmountsOut(200e6, [tokenB, wavax]))[1],
    ]);

    const expectOutCFromWeth = (
      await router.getAmountsOut(wavaxOutFromA.add(wavaxOutFromB), [
        wavax,
        tokenC,
      ])
    )[1];

    await multiAssetSwapper.swapMultiTokensForToken(
      [tokenA, tokenB],
      [100e6, 200e6],
      0,
      tokenC,
      deployer.address
    );
    const [tokenABal, tokenBBal, tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);

    expect(_tokenABal.sub(100e6), "tokenA balance").to.equal(tokenABal);
    expect(_tokenBBal.sub(200e6), "tokenB balance").to.equal(tokenBBal);
    expect(
      _tokenCBal.add(expectOutCFromWeth),
      "tokenC balance"
    ).to.approximately(tokenCBal, 100);
  });

  it("swapTokenForMultiTokens Token -> Tokens", async () => {
    const { getTokensBalanceOf } = await centralFixture();

    const [_tokenABal, _tokenBBal, _tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);
    const [wavaxAmountIn1, wavaxAmountIn2] = await Promise.all([
      router.getAmountsIn(100e6, [wavax, tokenA]),
      router.getAmountsIn(12e5, [wavax, tokenB]),
    ]);
    const [amountIns] = await Promise.all([
      router.getAmountsIn(wavaxAmountIn1[0].add(wavaxAmountIn2[0]), [
        tokenC,
        wavax,
      ]),
    ]);
    const amountIn = amountIns[0].add(amountIns[0].div(400));

    await multiAssetSwapper.swapTokenForMultiTokens(
      tokenC,
      amountIn,
      [100e6, 12e5],
      [tokenA, tokenB],
      deployer.address
    );
    const [tokenABal, tokenBBal, tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);
    expect(_tokenABal.add(100e6), "tokenA balance").to.equal(tokenABal);
    expect(_tokenBBal.add(12e5), "tokenB balance").to.equal(tokenBBal);
    expect(_tokenCBal.sub(amountIn), "tokenC balance").to.equal(tokenCBal);
  });

  it("swapTokenForMultiTokens TokenX -> Tokens,TokenX", async () => {
    const { getTokensBalanceOf } = await centralFixture();

    const [_tokenABal, _tokenBBal, _tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);
    const [wavaxAmountIn1, wavaxAmountIn2] = await Promise.all([
      router.getAmountsIn(100e6, [wavax, tokenA]),
      router.getAmountsIn(12e5, [wavax, tokenB]),
    ]);
    const [amountIns] = await Promise.all([
      router.getAmountsIn(wavaxAmountIn1[0].add(wavaxAmountIn2[0]), [
        tokenA,
        wavax,
      ]),
    ]);
    const amountIn = amountIns[0].add(amountIns[0].div(400));

    await multiAssetSwapper.swapTokenForMultiTokens(
      tokenA,
      amountIn,
      [100e6, 12e5],
      [tokenA, tokenB],
      deployer.address
    );
    const [tokenABal, tokenBBal, tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);
    expect(_tokenABal.add(100e6).sub(amountIn), "tokenA balance").to.equal(tokenABal);
    expect(_tokenBBal.add(12e5), "tokenB balance").to.equal(tokenBBal);
    expect(_tokenCBal, "tokenC balance").to.equal(tokenCBal);
  });

  it("swapTokenForMultiTokens Token -> Tokens,WAVAX", async () => {
    const { getTokensBalanceOf } = await centralFixture();
    const expectAmount = {
      tokenA: 100e6,
      tokenB: 12e5,
      wavax: 15e6,
    };

    const [_tokenABal, _tokenBBal, _tokenCBal, _wavaxBal] =
      await getTokensBalanceOf([tokenA, tokenB, tokenC, wavax]);
    const [wavaxAmountIn1, wavaxAmountIn2] = await Promise.all([
      router.getAmountsIn(expectAmount.tokenA, [wavax, tokenA]),
      router.getAmountsIn(expectAmount.tokenB, [wavax, tokenB]),
    ]);
    const [amountIns] = await Promise.all([
      router.getAmountsIn(
        wavaxAmountIn1[0].add(wavaxAmountIn2[0]).add(expectAmount.wavax),
        [tokenC, wavax]
      ),
    ]);
    const amountIn = amountIns[0].add(amountIns[0].div(400));

    await multiAssetSwapper.swapTokenForMultiTokens(
      tokenC,
      amountIn,
      [expectAmount.tokenA, expectAmount.tokenB, expectAmount.wavax],
      [tokenA, tokenB, wavax],
      deployer.address
    );
    const [tokenABal, tokenBBal, tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);
    expect(_tokenABal.add(100e6), "tokenA balance").to.equal(tokenABal);
    expect(_tokenBBal.add(12e5), "tokenB balance").to.equal(tokenBBal);
    expect(_tokenCBal.sub(amountIn), "tokenC balance").to.equal(tokenCBal);
  });
});
