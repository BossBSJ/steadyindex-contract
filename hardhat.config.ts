import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatNetworkForkingUserConfig } from "hardhat/types";
import { ethers } from "ethers";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const ETHERSCAN_API = process.env.ETHERSCAN_API || ""
const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY || ""
const ACCOUNT_PRIVATE_KEY2 = process.env.ACCOUNT_PRIVATE_KEY2 || ""
const INFURA_API_KEY = process.env.INFURA_API_KEY || ""
const SNOWTRACE_API = process.env.SNOWTRACE_API || ""

type NetworkSupport = "fuji" | "goerli" | "avalanche";

const forking: Record<NetworkSupport, HardhatNetworkForkingUserConfig> = {
  goerli: {
    url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  },
  fuji: {
    url: "https://api.avax-test.network/ext/bc/C/rpc",
  },
  avalanche: {
    url: "https://api.avax.network/ext/bc/C/rpc",
  },
};

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // viaIR: true,
    },
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    fuji: {
      // url: `https://avalanche-fuji.infura.io/v3/${INFURA_API_KEY}`,
      // accounts: [ACCOUNT_PRIVATE_KEY]
      chainId: 43113,
      gasPrice: 225000000000,
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    hardhat: {
      chainId: 99999,
      forking: forking.avalanche,
      accounts: [
        { privateKey: ACCOUNT_PRIVATE_KEY, balance: ethers.utils.parseEther('1000000000000').toString() },
        { privateKey: ACCOUNT_PRIVATE_KEY2, balance: ethers.utils.parseEther('1000000000000').toString() },
      ],
    },
  },
  etherscan: {
    apiKey: SNOWTRACE_API,
  },
  
};

export default config;

// module.exports = {
//   networks: {
//     fuji: {
//       chainId: 43113,
//       gasPrice: 225000000000,
//       url: "https://api.avax-test.network/ext/bc/C/rpc",
//       accounts: [ACCOUNT_PRIVATE_KEY],
//     }
//   },
//   etherscan: {
//     apiKey: SNOWTRACE_API
//   }
// };