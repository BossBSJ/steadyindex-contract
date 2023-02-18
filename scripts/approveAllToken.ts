import { ethers } from "hardhat";

const tokenA = '0xCa9233123E7Af224064A83a6deD5A052A13759A6'
const tokenB = '0xFA3bd1d02895c91762AD56bc0B863Af1A9Ebd666'
const tokenC = '0x8e620499181e7f5f548Ac16eE9ce394e033a9954'

const targetAddress = '0x8137703bc25cB7C08C536eD4feCA68Dd7B7A3e7c'

async function main() {
    const [deployer] = await ethers.getSigners();
    const ERC20 = await ethers.getContractFactory('SimpleToken');
    [tokenA, tokenB, tokenC].map((tokenAddr, idx) => {
      setTimeout(async () => {
         const token = await ERC20.attach(tokenAddr)
         await token.approve(targetAddress, '100000000000000000000000')
      }, idx*5000)
    })
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
