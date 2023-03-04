import hre, { ethers } from "hardhat";
import { toE, toE18 } from "../constant";

async function main () {
    await hre.run("verify:verify", {
        address: "0xC2d80d777225F6c4e0097528FDf05f7e978eBeCE", //
        constructorArguments: [ //
            ["0xd00ae08403B9bbb9124bB305C09058E32C39A48c","0xB6076C93701D6a07266c31066B298AeC6dd65c2d"],
            ["12121226664676763463", "90112775"],
            [toE18(70), toE18(30)],
            "0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6",
            "First Index Token",
            "FIT",
            "0xf0b7Ba9BE0D806136E86b8415038f57daC720c92"
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