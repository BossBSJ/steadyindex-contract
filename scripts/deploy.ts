import hre from "hardhat";
import { centralFixture } from "../test/shares/fixtures";
import { MyAddr, avalancheTestnetRealToken, toE, toE18, avalanche } from "../constant";
import { erc20Service } from "../services/erc20Service";



async function main() {
  const components = {
    A: { addr: avalanche.tokenA, unit: 50e6 },
    B: { addr: avalanche.tokenB, unit: 50e6 },
    // A: { addr: avalancheTestnetRealToken.tokenB, unit: 50e6 },
    // B: { addr: avalancheTestnetRealToken.tokenC, unit: 50e6 },
  };

  const fixture = await centralFixture();
  // const fixture = await centralFixture(avalancheTestnetRealToken);

  console.log(
    "Deploying contracts with the account:",
    fixture.deployer.address
  );

  await fixture.initController();
  await fixture.indexTokenFactory.createIndexToken(
    [components.A.addr, components.B.addr],
    [components.A.unit, components.B.unit],
    [toE18(50), toE18(50)],
    fixture.deployer.address,
    "FirstIndex",
    "FIDX"
  );

  // const startPrice = 2000
  // const price1 = await erc20Service.fetchERC20Price("0x50b7545627a5162F82A992c33b87aDc75187B218")
  // const price2 = await erc20Service.fetchERC20Price("0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB")
  // const amount1 = startPrice * (50/100) / 22000
  // const amount2 = startPrice * (50/100) / 1500
  // const unit1 = toE18(Number(amount1.toFixed(18)))
  // const unit2 = toE18(Number(amount2.toFixed(18)))
  // const components2 = {
  //   WBTC: {addr: "0x50b7545627a5162F82A992c33b87aDc75187B218", unit: unit1, strategicUnit: toE18(50)},
  //   WETH: {addr: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", unit: unit2, strategicUnit: toE18(50)}
  // }
  // await fixture.indexTokenFactory.createIndexToken(
  //   [components2.WBTC.addr, components2.WETH.addr],
  //   [components2.WBTC.unit, components2.WETH.unit],
  //   [components2.WBTC.strategicUnit, components2.WETH.strategicUnit],
  //   fixture.deployer.address,
  //   "SecondIndex",
  //   "SIDX"
  // )

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


// npx hardhat run --network fuji scripts/deploy.ts
// npx hardhat verify --network fuji


// fuji
// {
//   controller: '0xfb17F057169643136B1639a776651C39355CF519',
//   multiAssetSwapper: '0x498B9473f09494BD21a4D948E9166F38046A5930',
//   indexTokenFactory: '0x41343c4FA023298F89C03884C7F33677C0ba16C7',
//   dcaManager: '0x00DEAEeE69A56750b7Ede732588C9cDbE11f0f67',
//   router: '0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901',
//   addresses: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
//   deployer: '0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6'
// }


//localhost
// {
//   controller: '0xac86Da4159A4870B8d28a22985045Db4424F12A3',
//   multiAssetSwapper: '0xdC6d26e19d7301380BCFB2241a6BeF1Da9C76267',
//   indexTokenFactory: '0x0Ac530201056b24286Cc45C9996BABfA96E807B7',
//   dcaManager: '0x2cBb031204EDc608307445f14957A58b942cbD96',
//   router: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
//   addresses: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
//   deployer: '0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6'
// }