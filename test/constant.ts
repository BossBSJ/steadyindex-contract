import { ethers } from "ethers";

export const MyAddr = "0x4A4803Ce8E17aC61F82312Ed4e3a43291c10f76d";
export const uniswapRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export const tokenA = "0xCa9233123E7Af224064A83a6deD5A052A13759A6";
export const tokenB = "0xFA3bd1d02895c91762AD56bc0B863Af1A9Ebd666";
export const tokenC = "0x8e620499181e7f5f548Ac16eE9ce394e033a9954";
export const wethAddr = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

export const toE18 = (n: number) =>
  ethers.BigNumber.from(n).mul(ethers.BigNumber.from(10).pow(18));
