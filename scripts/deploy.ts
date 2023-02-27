import hre from "hardhat";
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
  await fixture.indexTokenFactory.createIndexToken(
    [components.A.addr, components.B.addr],
    [components.A.unit, components.B.unit],
    [toE18(25), toE18(75)],
    fixture.deployer.address,
    "FirstIndex",
    "IDX"
  );

  const firstIndex = await fixture.getIndexToken(0);

  console.log({
    controller:fixture.controller.address,
    multiAssetSwapper:fixture.multiAssetSwapper.address,
    indexTokenFactory:fixture.indexTokenFactory.address,
    dcaManager:fixture.dcaManager.address,
    router:fixture.router.address,
    addresses:fixture.addresses.wavax,
    deployer:fixture.deployer.address,
  });
  console.log()
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
    firstIndex.address,
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

// {
//   controller: '0xE9fa08B395678eca3BD266dbfCB673e821a723E5',
//   multiAssetSwapper: '0x5B38086e6D0e2F4703D061847DA2bf4A36269e7e',
//   indexTokenFactory: '0xab4FaB62E68f17D39418bd8bf79f298B35284619'
// }
