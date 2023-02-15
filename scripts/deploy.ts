import { ethers } from "hardhat";

const tokenAddr = {
  main: {},
  test: {
    weth: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    uni: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Controller = await ethers.getContractFactory("Controller");
  const controller = await Controller.deploy();

  const MultiAssetSwapper = await ethers.getContractFactory(
    "MultiAssetSwapper"
  );
  const multiAssetSwapper = await MultiAssetSwapper.deploy(
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    controller.address
  );

  const IndexTokenFactory = await ethers.getContractFactory(
    "IndexTokenFactory"
  );
  const indexTokenFactory = await IndexTokenFactory.deploy(controller.address);

  await controller.initialize(indexTokenFactory.address, multiAssetSwapper.address);

  await indexTokenFactory.createIndexToken(
    [tokenAddr.test.weth, tokenAddr.test.uni],
    [1000, 2000],
    deployer.address,
    "stIndex",
    "STI"
  );

  console.log({
    controller: controller.address,
    multiAssetSwapper: multiAssetSwapper.address,
    indexTokenFactory: indexTokenFactory.address,
  });
  console.log( 'for copy to verify contract:\n',
    controller.address,
    multiAssetSwapper.address,
    indexTokenFactory.address
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