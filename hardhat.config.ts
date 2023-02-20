import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatNetworkForkingUserConfig } from "hardhat/types";
import { ethers } from "ethers";


const ALCHEMY_API_KEY = "ceRvvQa8Ny2oWeSfaHTjYmcCOePdnS6p";
const ACCOUNT_PRIVATE_KEY =
  "e12f0f7df5b08b20fb7ccd301a913a1f6adeba415cd915370039fd6bc5c3dbe0";
const ETHERSCAN_API = "RBGTYAE7X2KYNZEJ8HMEGRENW4CUYYY2VQ";
const SNOWTRACE_API = "MMMSGHFSRE1YW6P6AVCFFVAK6H2V3ZSP83";

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
      chainId: 43113,
      gasPrice: 225000000000,
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    hardhat: {
      forking: forking.avalanche,
      accounts: [
        { privateKey: ACCOUNT_PRIVATE_KEY, balance: ethers.utils.parseEther('1000000000000').toString() },
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