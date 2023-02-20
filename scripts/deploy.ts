import { ethers } from "hardhat";
import { centralFixture } from "../test/shares/fixtures";
import { MyAddr, avalancheTestnet, toE, toE18 } from "../constant";


async function main() {
  const components = {
    A: { addr: avalancheTestnet.tokenA, unit: 25e6 },
    B: { addr: avalancheTestnet.tokenB, unit: 75e6 },
  };
  // (await ethers.getContractAt("IndexTokenFactory", "0xae7b1530cb79748c878f44fe7e8289f09c9edb45")).createIndexToken(
  //   [components.A.addr, components.B.addr],
  //   [components.A.unit, components.B.unit],
  //   [toE18(25), toE18(75)],
  //   MyAddr,
  //   "FirstIndex",
  //   "IDX"
  // );

  const fixture = await centralFixture(avalancheTestnet);

  console.log(
    "Deploying contracts with the account:",
    fixture.deployer.address
  );

  await fixture.initController();
  // await fixture.indexTokenFactory.createIndexToken(
  //   [components.A.addr, components.B.addr],
  //   [components.A.unit, components.B.unit],
  //   [toE18(25), toE18(75)],
  //   fixture.deployer.address,
  //   "FirstIndex",
  //   "IDX"
  // );

  // const firstIndex = await fixture.getIndexToken(0);

  // console.log({
  //   controller: fixture.controller.address,
  //   multiAssetSwapper: fixture.multiAssetSwapper.address,
  //   indexTokenFactory: fixture.indexTokenFactory.address,
  // });
  console.log(
    "for copy to verify contract:\n",
    "./verify.sh ",
      fixture.controller.address,
      fixture.multiAssetSwapper.address,
      fixture.indexTokenFactory.address,
      fixture.dcaManager.address,
      fixture.router.address,
      fixture.addresses.wavax,
      fixture.deployer.address,
    {
      controller: fixture.controller.address,
      multiAssetSwapper: fixture.multiAssetSwapper.address,
      indexTokenFactory: fixture.indexTokenFactory.address,
      dcaManager: fixture.dcaManager.address,
      router: fixture.router.address,
      addresses: fixture.addresses.wavax,
      deployer: fixture.deployer.address,
  }
    // firstIndex.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"
// npx hardhat verify --network goerli 0xab4FaB62E68f17D39418bd8bf79f298B35284619 "0xE9fa08B395678eca3BD266dbfCB673e821a723E5"

// {
//   controller: '0xE9fa08B395678eca3BD266dbfCB673e821a723E5',
//   multiAssetSwapper: '0x5B38086e6D0e2F4703D061847DA2bf4A36269e7e',
//   indexTokenFactory: '0xab4FaB62E68f17D39418bd8bf79f298B35284619'
// }

// npx hardhat run --network fuji scripts/deploy.ts
// npx hardhat verify --network fuji


// controller 0x4Fe0E150e6A098eE47f874a31d7905D2CA9D3337
// multiAssetSwap 0xE8e8713DEc79B530F4D034f77A092cD72Ef84B33
// factory 0x2171cec34E849F4CAEafaCbF97BE428b88a68d17
// dca 0x2E91A966cAB8de3a33EA858606206Be720F233b5

// router 0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901
// WAVAX 0xd00ae08403B9bbb9124bB305C09058E32C39A48c



