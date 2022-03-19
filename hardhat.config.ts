import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solhint";
import "hardhat-deploy";
import "solidity-coverage";
import "@typechain/hardhat";

import { HardhatUserConfig } from "hardhat/config";
import { config as dotEnvConfig } from "dotenv";

dotEnvConfig();

const {
  FIRST_PRIVATE_KEY, 
  SECOND_PRIVATE_KEY,
  ALCHEMY_RINKEBY_API_KEY, 
  ALCHEMY_ROPSTEN_API_KEY, 
  ETHERSCAN_API_KEY,
  BSCSCAN_API_KEY
} = process.env;

// задачи
import "./tasks/transfer";
import "./tasks/approve";
import "./tasks/transfer-from";
import "./tasks/mint";
import "./tasks/burn";

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_RINKEBY_API_KEY}`,
      accounts: [FIRST_PRIVATE_KEY || "", SECOND_PRIVATE_KEY || ""],
    },
    ropsten: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_ROPSTEN_API_KEY}`,
      accounts: [FIRST_PRIVATE_KEY || "", SECOND_PRIVATE_KEY || ""],
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [FIRST_PRIVATE_KEY || "", SECOND_PRIVATE_KEY || ""],
    },
  },
  etherscan: {
    apiKey: {
      // ethereum
      mainnet: ETHERSCAN_API_KEY,
      ropsten: ETHERSCAN_API_KEY,
      rinkeby: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      kovan: ETHERSCAN_API_KEY,
      // binance smart chain
      bsc: BSCSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY,
    }
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
