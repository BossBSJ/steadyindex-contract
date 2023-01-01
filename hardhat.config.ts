import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_API_KEY = "ceRvvQa8Ny2oWeSfaHTjYmcCOePdnS6p";
const ACCOUNT_PRIVATE_KEY = "e12f0f7df5b08b20fb7ccd301a913a1f6adeba415cd915370039fd6bc5c3dbe0";
const ETHERSCAN_API = "RBGTYAE7X2KYNZEJ8HMEGRENW4CUYYY2VQ";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API,
  },
};

export default config;
