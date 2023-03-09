import type { Axios } from "axios";
import axios from "axios";
import { Address } from "wagmi"
import { fetchBlockNumber } from '@wagmi/core'

class ERC20Service {
    private axios: Axios

    constructor() {
        this.axios = axios.create({
            baseURL: "https://deep-index.moralis.io/api/v2",
            headers: {
                Accept: "application/json", 
                "X-API-Key": "euw3Dt8w7JM1ohFU1TKGmhofy3TvjxP1q38xapOU3U2w6TLs1n3aYS4WMuoTEkT1"
            }
        })
    }
    
    fetchERC20Price = async (erc20address: Address | string, blockNumber?: number) => {
        let address = erc20address
        if(erc20address === "0xd00ae08403B9bbb9124bB305C09058E32C39A48c"){ //wavax
            address = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"
        }
        else if(erc20address === "0xB6076C93701D6a07266c31066B298AeC6dd65c2d"){ //usdc
            address = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
        }
        else if(erc20address === "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846"){ //link
            address = "0x5947bb275c521040051d82396192181b413227a3"
        }
        const response = await this.axios.request({
            method: "GET",
            url: `/erc20/${address}/price`,
            params: {chain: "avalanche", to_block: blockNumber?.toString()}
        })

        return response.data.usdPrice
    }
}

export const erc20Service = new ERC20Service()