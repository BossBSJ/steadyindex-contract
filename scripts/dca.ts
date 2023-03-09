import { BigNumber } from "ethers";
import hre, { ethers } from "hardhat";
import { indexService } from "../services/indexService";
import { time } from "@nomicfoundation/hardhat-network-helpers";
//acc1 0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6
//acc2 0xD284F0e2AF3a8734A4d98E3ff40e155187490F52

const dcaManagerAddr = "0x2cBb031204EDc608307445f14957A58b942cbD96"

interface investment {
    id:number
    investment: {
        trusted:string, 
        tokenIn:string, 
        tokenInAmount:BigNumber, 
        indexTokenAddr:string, 
        lastBuy:BigNumber, 
        cycle:BigNumber
    }
}

async function getInvestment() {

    const myAddr = "0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6" //acc1

    const dcaManager = await hre.ethers.getContractAt("DCAManager", dcaManagerAddr);
    const investors = await dcaManager.getInvestorsForTrustedAddr(myAddr)

    let allInvesment = [] 
    for(let i = 0; i < investors.length; i++){
        const allInvestmentsAccount = await dcaManager.InvestmentsForAccount(investors[i])
        let filterInvestments = []

        for(let j = 0; j < allInvestmentsAccount.length; j++){
            if(allInvestmentsAccount[j].trusted === myAddr){
                filterInvestments.push({
                    id: j,
                    investment: allInvestmentsAccount[j],
                })
            }
        }
        allInvesment.push(filterInvestments)
    }
    return { allInvesment, investors }
}

function checkCycle(lastBuy:number, cycle:number) {
    const timestampInSeccond = Date.now() / 1000
    if(timestampInSeccond >= lastBuy + cycle) {
        console.log("cycle", cycle)
        console.log("lastBuy", lastBuy)
        console.log("timestampInSeccond",timestampInSeccond)
        return true
    }
    return false
}

async function dca(investors:string[], allInvesment:investment[][]){
    const dcaManager = await hre.ethers.getContractAt("DCAManager", dcaManagerAddr);
    for(let i = 0; i < investors.length; i++){
        const investor = investors[i]
        const investment = allInvesment[i]
        for(let j = 0; j < investment.length; j++){
            const idInvestment = investment[j].id
            const lastBuy = Number(investment[j].investment.lastBuy._hex)
            const cycle = Number(investment[j].investment.cycle._hex)
            const indexAddress = investment[j].investment.indexTokenAddr
            const tokenInPerPeriod = Number(investment[j].investment.tokenInAmount._hex) / 10**6

            if(checkCycle(lastBuy, cycle)){
                const indexPrice = await indexService.getPrice(indexAddress)
                const indexAmountBuy = ethers.utils.parseUnits(String(tokenInPerPeriod / indexPrice),18)
                await dcaManager.buyFor(investor, idInvestment, indexAmountBuy)
                console.log(`dca in investment id ${idInvestment} of account ${investor} succesful`)
            }
        }
    }
}

async function assemble() {
    const {investors, allInvesment} = await getInvestment()
    await dca(investors, allInvesment)
}

// คนรัน scirpt เป็น manager ของ index
async function main() {

    setInterval(assemble,3000)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// npx hardhat run --network localhost scripts/dca.ts