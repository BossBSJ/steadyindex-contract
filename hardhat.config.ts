import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatNetworkForkingUserConfig } from "hardhat/types";
import { ethers } from "ethers";


const ALCHEMY_API_KEY = "ceRvvQa8Ny2oWeSfaHTjYmcCOePdnS6p";
// const ACCOUNT_PRIVATE_KEY = "e12f0f7df5b08b20fb7ccd301a913a1f6adeba415cd915370039fd6bc5c3dbe0";
const ETHERSCAN_API = "RBGTYAE7X2KYNZEJ8HMEGRENW4CUYYY2VQ";
// const SNOWTRACE_API = "MMMSGHFSRE1YW6P6AVCFFVAK6H2V3ZSP83";

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


const ACCOUNT_PRIVATE_KEY = "b1a0bffff5a833f3cea964f8b89781309231f0945063930a3d67d3ed15a57a71"
const INFURA_API_KEY = "277bc7d8706548eda0e105d5b4c4c7ff"
const SNOWTRACE_API = "WCJYM7T7SSI4DDBH9GV9HAVGP7RVB5JWX3"

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