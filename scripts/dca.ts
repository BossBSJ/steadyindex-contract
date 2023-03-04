import hre from "hardhat";

//assume คนรัน scirpt เป็น manager ของ index
async function main() {
    const dcaManagerAddr = "0x2cBb031204EDc608307445f14957A58b942cbD96"
    const dcaManager = await hre.ethers.getContractAt("DCAManager", dcaManagerAddr);
    const tmp = await dcaManager.InvestmentsForAccount(
        "0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6",
    )
    console.log(tmp)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// npx hardhat run --network localhost scripts/dca.ts