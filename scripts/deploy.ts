import { ethers } from "hardhat";
import { centralFixture } from "../test/shares/fixtures";
import { MyAddr, avalancheTestnetRealToken, toE, toE18 } from "../constant";


async function main() {
  const components = {
    A: { addr: avalancheTestnetRealToken.tokenA, unit: 25e6 },
    B: { addr: avalancheTestnetRealToken.tokenB, unit: 75e6 },
  };
  // (await ethers.getContractAt("IndexTokenFactory", "0xae7b1530cb79748c878f44fe7e8289f09c9edb45")).createIndexToken(
  //   [components.A.addr, components.B.addr],
  //   [components.A.unit, components.B.unit],
  //   [toE18(25), toE18(75)],
  //   MyAddr,
  //   "FirstIndex",
  //   "IDX"
  // );

  const fixture = await centralFixture(avalancheTestnetRealToken);

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


// {
//   controller: '0x1D5518120BeF0b4DFa934bc53e68F09062F40ECD',
//   multiAssetSwapper: '0x8d51929Ea3a58a705Dba4bB87D58d85242bd2e41',
//   indexTokenFactory: '0xa67D20cC70dfAd46a7EEB1b9eBBB33e8D4fCA9c2',
//   dcaManager: '0xe96D728fC8dA5FAB6075BCdFe88Bec84eeE8d3fb',
//   router: '0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901',
//   addresses: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
//   deployer: '0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6'
// }