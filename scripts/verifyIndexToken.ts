import hre, { ethers } from "hardhat";
import { toE, toE18 } from "../constant";

async function main () {
    await hre.run("verify:verify", {
        address: "0xef69a701219a873a97e587c71b6c98d06da227dc", //
        constructorArguments: [ //
            ["0xd00ae08403B9bbb9124bB305C09058E32C39A48c", "0xB6076C93701D6a07266c31066B298AeC6dd65c2d"],
            ["1673994362323798724", "14999944"],
            [toE18(70), toE(30,18)],
            "0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6",
            "My Token Index",
            "MTI",
            "0xb1aAAfbC0E6c358441FA8C8BBA00EE31583f971A"
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