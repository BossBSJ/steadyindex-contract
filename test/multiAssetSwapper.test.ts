import { MultiAssetSwapper } from "../typechain-types/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20__factory, IJoeRouter02 } from "../typechain-types";
import { expect } from "chai";
import { avalanche } from "../constant";
import { centralFixture } from "./shares/fixtures";

const { tokenA, tokenB, tokenC, wavax } = avalanche;

describe("MultiAssetSwapper", () => {
  let deployer: SignerWithAddress;
  let multiAssetSwapper: MultiAssetSwapper;
  let router: IJoeRouter02;
  let ERC20: ERC20__factory;

  before(async () => {
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
console.log(_tokenABal, _tokenBBal, _tokenCBal)
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

    console.log("actual bal", tokenCBal.toString());
    expect(_tokenABal.sub(100e6), "tokenA balance").to.equal(tokenABal);
    expect(_tokenBBal.sub(200e6), "tokenB balance").to.equal(tokenBBal);
    expect(
      _tokenCBal.add(expectOutCFromWeth),
      "tokenC balance"
    ).to.approximately(tokenCBal, 2);
  });

  it("swapTokenForMultiTokens", async () => {
    const { getTokensBalanceOf } = await centralFixture();

    const [_tokenABal, _tokenBBal, _tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);
    const [wethAmountIn1, wethAmountIn2] = await Promise.all([
      router.getAmountsIn(100e6, [wavax, tokenA]),
      router.getAmountsIn(12e5, [wavax, tokenB]),
    ]);
    const [amountIns] = await Promise.all([
      router.getAmountsIn(wethAmountIn1[0].add(wethAmountIn2[0]), [
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
});
