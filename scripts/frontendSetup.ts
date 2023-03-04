import { ethers } from "ethers";
import hre from "hardhat";
import { avalanche, MyAddr } from "../constant";
import { centralFixture } from "../test/shares/fixtures";

async function main() {

  const usdcAddress = "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"

  const fixture = await centralFixture();

  const maxInt = ethers.BigNumber.from(2).pow(256).sub(1)
  await fixture.addrApproveTokenForSpender(usdcAddress, avalanche.joeRouter02, String(maxInt), MyAddr)

  const router = await hre.ethers.getContractAt("IJoeRouter02", avalanche.joeRouter02);
  const [deployer] = await hre.ethers.getSigners();

  router.swapExactAVAXForTokens(
    0,
    [avalanche.wavax, usdcAddress],
    deployer.address,
    Math.floor(Date.now() / 1000) + 60 * 10,
    { value: hre.ethers.utils.parseEther("10000") }
  )


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
