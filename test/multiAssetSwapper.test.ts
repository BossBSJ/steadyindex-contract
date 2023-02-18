import { MultiAssetSwapper } from "../typechain-types/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20__factory, IUniswapV2Router02 } from "../typechain-types";
import { expect } from "chai";
import { tokenA, tokenB, tokenC, wethAddr } from "./constant";
import { centralFixture } from "./shares/fixtures";

describe("MultiAssetSwapper", () => {
  let deployer: SignerWithAddress;
  let multiAssetSwapper: MultiAssetSwapper;
  let uniswapRouter: IUniswapV2Router02;
  let ERC20: ERC20__factory;

  before(async () => {
    const fixture = await centralFixture();
    deployer = fixture.deployer;
    multiAssetSwapper = fixture.multiAssetSwapper;
    uniswapRouter = fixture.uniswapRouter;
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
    const [wethOutFromA, wethOutFromB] = await Promise.all([
      (await uniswapRouter.getAmountsOut(1e10, [tokenA, wethAddr]))[1],
      (await uniswapRouter.getAmountsOut(2e10, [tokenB, wethAddr]))[1],
    ]);
    const expectOutCFromWeth = (
      await uniswapRouter.getAmountsOut(wethOutFromA.add(wethOutFromB), [
        wethAddr,
        tokenC,
      ])
    )[1];
    await multiAssetSwapper.swapMultiTokensForToken(
      [tokenA, tokenB],
      [1e10, 2e10],
      0,
      tokenC,
      deployer.address
    );
    const [tokenABal, tokenBBal, tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);
    expect(_tokenABal.sub(1e10)).to.equal(tokenABal);
    expect(_tokenBBal.sub(2e10)).to.equal(tokenBBal);
    expect(_tokenCBal.add(expectOutCFromWeth)).to.equal(tokenCBal);
  });

  it("swapTokenForMultiTokens", async () => {
    const { getTokensBalanceOf } = await centralFixture();

    const [_tokenABal, _tokenBBal, _tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);
    const [wethAmountIn1, wethAmountIn2] = await Promise.all([
      uniswapRouter.getAmountsIn(1e10, [wethAddr, tokenA]),
      uniswapRouter.getAmountsIn(12e9, [wethAddr, tokenB]),
    ]);
    const [amountIns] = await Promise.all([
      uniswapRouter.getAmountsIn(wethAmountIn1[0].add(wethAmountIn2[0]), [
        tokenC,
        wethAddr,
      ]),
    ]);
    const amountIn = amountIns[0];

    await multiAssetSwapper.swapTokenForMultiTokens(
      tokenC,
      amountIn,
      [1e10, 12e9],
      [tokenA, tokenB],
      deployer.address
    );
    const [tokenABal, tokenBBal, tokenCBal] = await getTokensBalanceOf([
      tokenA,
      tokenB,
      tokenC,
    ]);
    expect(_tokenABal.add(1e10), "tokenA").to.equal(tokenABal);
    expect(_tokenBBal.add(12e9), "tokenB").to.equal(tokenBBal);
    expect(_tokenCBal.sub(amountIn), "tokenC").to.equal(tokenCBal);
  });
});
