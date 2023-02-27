import hre from "hardhat";
import { centralFixture } from "../test/shares/fixtures";
import { MyAddr, avalancheTestnetRealToken, toE, toE18 } from "../constant";


async function main() {
  const components = {
    A: { addr: avalancheTestnetRealToken.tokenA, unit: 25e18 },
    B: { addr: avalancheTestnetRealToken.tokenB, unit: 75e6 },
  };

  const fixture = await centralFixture(avalancheTestnetRealToken);

  console.log(
    "Deploying contracts with the account:",
    fixture.deployer.address
  );

  await fixture.initController();
  // await fixture.indexTokenFactory.createIndexToken(
  //   [components.A.addr, components.B.addr],
  //   [components.A.unit, components.B.unit],
  //   [toE18(25), toE(75,6)],
  //   fixture.deployer.address,
  //   "FirstIndex",
  //   "IDX"
  // );

  // const firstIndex = await fixture.getIndexToken(0);

  console.log({
    controller: fixture.controller.address,
    multiAssetSwapper: fixture.multiAssetSwapper.address,
    indexTokenFactory: fixture.indexTokenFactory.address,
    dcaManager: fixture.dcaManager.address
  });
  console.log(
    "for copy to verify contract (if the auto verify was failed):\n",
    "./verify.sh ",
    fixture.controller.address,
    fixture.multiAssetSwapper.address,
    fixture.indexTokenFactory.address,
    fixture.dcaManager.address,
    fixture.router.address,
    fixture.addresses.wavax,
    fixture.deployer.address,
    // firstIndex.address,
    '\n'
  );

  // await hre.run("verify:verify", {
  //   address: "address-of-your-smart-contract",
  //   constructorArguments: ["parameter1","parameter2"],
  //   // for example, if your constructor argument took an address, do something like constructorArguments: ["0xABCDEF..."],
  //   });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"
// npx hardhat verify --network goerli 0xab4FaB62E68f17D39418bd8bf79f298B35284619 "0xE9fa08B395678eca3BD266dbfCB673e821a723E5"


// npx hardhat run --network fuji scripts/deploy.ts
// npx hardhat verify --network fuji

// {
//   controller: '0x4452Fb72fA923Bff70d543fF59f853d1129a3D79',
//   multiAssetSwapper: '0x08bDB338E912B2d063cA4AFA85597e88c2598E4c',
//   indexTokenFactory: '0x5A3673B6e906b5ab8b59A7A45321906837A29bC2',
//   dcaManager: '0x3eA28ABa363Ec919286466bFBddb71Be8Fa3BCd2'
// }