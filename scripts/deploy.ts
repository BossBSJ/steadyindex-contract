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

//fuji
// {
//   controller: '0x79344A4A31905c64390C42e3be89c183FCD35789',
//   multiAssetSwapper: '0x37Ee0524146c1449c23b04B05151E0b670FD193a',
//   indexTokenFactory: '0x16C54485Dee21B449A56dcEd688e8cED21eA8A25',
//   dcaManager: '0x5424733818873Cb67719945cab27535429b5FaBF',
//   router: '0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901',
//   addresses: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
//   deployer: '0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6'
// }

