import { ethers } from "ethers";

// export const uniswapRouterAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
// export const tokenA = "0xCa9233123E7Af224064A83a6deD5A052A13759A6";
// export const tokenB = "0xFA3bd1d02895c91762AD56bc0B863Af1A9Ebd666";
// export const tokenC = "0x8e620499181e7f5f548Ac16eE9ce394e033a9954";
// export const wethAddr = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

export const MyAddr = "0x4A4803Ce8E17aC61F82312Ed4e3a43291c10f76d";

export const avalancheTestnet = {
  joeRouter02: "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901",
  tokenA: "0x33eC72CAb468B92d958b7E6EDB166F4F90141621",
  tokenB: "0xab4FaB62E68f17D39418bd8bf79f298B35284619",
  tokenC: "0xc6E8e58Ffa320E4E5E542c02A51478B74e9Bc154",
  wavax: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
  lbRouter: "0x7b50046cEC8252ca835b148b1eDD997319120a12",
};
const avalancheMainnet = {
  joeRouter02: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
  tokenA: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e", // usdc 6
  tokenB: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7", // usdt 6
  // tokenB: "0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd", // joe
  tokenC: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", // usdc.e 6
  // tokenC: "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab", // weth
  wavax: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  lbRouter: "0xE3Ffc583dC176575eEA7FD9dF2A7c65F7E23f4C3",
};

export const avalanche = avalancheMainnet;

export const toE18 = (n: number) =>
  ethers.BigNumber.from(n).mul(ethers.BigNumber.from(10).pow(18));
export const toE = (n: number, e: number) =>
  ethers.BigNumber.from(n).mul(ethers.BigNumber.from(10).pow(e));
