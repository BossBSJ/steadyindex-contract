import { ethers } from "hardhat";

const multiAssetSwapperAddr = "0x8137703bc25cB7C08C536eD4feCA68Dd7B7A3e7c";

async function main() {
  const [deployer] = await ethers.getSigners();
  const MultiAssetSwapper = await ethers.getContractFactory(
    "MultiAssetSwapper"
  );
  const multiAssetSwapper = await MultiAssetSwapper.attach(
    multiAssetSwapperAddr
  );

  await multiAssetSwapper.swap(
    [
      "0xCa9233123E7Af224064A83a6deD5A052A13759A6",
      "0xFA3bd1d02895c91762AD56bc0B863Af1A9Ebd666",
    ],
    [1e1, 2e1],
    "0x8e620499181e7f5f548Ac16eE9ce394e033a9954"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
