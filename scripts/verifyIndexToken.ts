import hre, { ethers } from "hardhat";
import { toE, toE18 } from "../constant";

async function main () {
    await hre.run("verify:verify", {
        address: "0x13825e10479822b39577900fa7d032cDbCD76C52", //
        constructorArguments: [ //
            ["0xB6076C93701D6a07266c31066B298AeC6dd65c2d"],
            ["999022"],
            [toE18(100)],
            "0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6",
            "Only USDC",
            "USDS",
            "0x4452Fb72fA923Bff70d543fF59f853d1129a3D79"
        ]
    })
    // console.log(ethers.utils.parseUnits("1.673994362323798724",18))
    // console.log(ethers.utils.parseUnits("14.999944",6))
    // console.log(toE18(70))
    // console.log(toE(30,6))
    // "1673994362323798724"
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});