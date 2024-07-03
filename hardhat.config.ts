import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/config";
// require("@nomiclabs/hardhat-ethers");
import dotenv from "dotenv";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    // ethereum: {
    //   chainId: 1,
    //   url: "https://mainnet.infura.io/v3/your-infura-key",
    //   // accounts: [PRIVATE_KEY!],
    //   allowUnlimitedContractSize: true,
    // },
    holesky: {
      chainId: 17000,
      url: "https://holesky.infura.io/v3/d27fbc91663742459e5667d5fe965493",
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  gasReporter: {
    enabled: true, // change when gas_report is needed
    currency: "USD",
    outputFile: "gas_report.txt",
    noColors: false,
    coinmarketcap: "",
  },
  paths: {
    artifacts: "build/artifacts",
    cache: "build/cache",
    sources: "contracts",
  },
};

export default config;
