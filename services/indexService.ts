import { fetchToken } from "@wagmi/core";
import type { Axios } from "axios";
import axios from "axios"
import { Address } from "wagmi";
import { erc20Service } from "./erc20Service";
import hre from "hardhat";
import { BigNumber } from "ethers";

interface component {
    address: string;
    unit: BigNumber;
    decimals: number;
    price: any;
}

class IndexService {

    //get component address => []
    getPrice = async (indexAddress:Address | string) => {
        const indexToken = await hre.ethers.getContractAt("IndexToken", indexAddress);
        const ERC20 = await hre.ethers.getContractFactory("ERC20");
        const componentAddress = await indexToken.getComponents()
        const positionUnits = await indexToken.getPositions()
        let component:component[] = []
        for(let i = 0 ;i < componentAddress.length; i++){
            const tokenPrice = await erc20Service.fetchERC20Price(componentAddress[i])
            const decimals = await ERC20.attach(componentAddress[i]).decimals()
            component.push({
                address: componentAddress[i],
                unit: positionUnits[i].unit,
                decimals: decimals,
                price: tokenPrice
            })
        }

        let price = 0
        for(let i = 0; i < component.length; i++){
            const unit = Number(component[i].unit._hex) / 10**component[i].decimals
            price = price + unit * component[i].price

        }

        return price
    }
}

export const indexService = new IndexService()