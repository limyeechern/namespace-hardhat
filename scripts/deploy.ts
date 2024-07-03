// const dotenv = require("dotenv");
// dotenv.config();
import { ethers } from "hardhat";
// const verify = require("./verify-contract");
import { formatNumberWithCommas } from "../utils/utils";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const NameSpaceTokenFactory = await ethers.getContractFactory(
    "NameSpaceToken"
  );
  let txReq = await NameSpaceTokenFactory.getDeployTransaction(1000000000);
  await getConfirmation(txReq);

  console.log("Deploying NameSpaceToken...");

  // Deploying NameSpaceToken
  const NameSpaceTokenContract = await NameSpaceTokenFactory.deploy(
    1_000_000_000
  );
  await NameSpaceTokenContract.waitForDeployment();
  const tokenCA = await NameSpaceTokenContract.getAddress();
  console.log("Token Contract deployed to:", tokenCA);

  const NameSpaceNFTFactory = await ethers.getContractFactory("NameSpaceNFT");
  txReq = await NameSpaceNFTFactory.getDeployTransaction(tokenCA, 550000, 50);
  await getConfirmation(txReq);

  console.log("Deploying NameSpaceNFT...");
  const NameSpaceNFTContract = await NameSpaceNFTFactory.deploy(
    tokenCA,
    550000,
    50
  );
  await NameSpaceNFTContract.waitForDeployment();
  const NFTCA = await NameSpaceNFTContract.getAddress();
  console.log("NFT Contract deployed to:", NFTCA);

  await NameSpaceTokenContract.setNFTAddress(NFTCA);
  console.log("NFT address set in token");
}

async function getConfirmation(txReq: any) {
  const estimatedGas = await ethers.provider.estimateGas(txReq);
  const estimatedGasPrice = (await ethers.provider.getFeeData()).gasPrice!;
  // const estimatedGasPrice = await ethers.provider.getGasPrice();
  const estimatedTransactionFee = estimatedGas * estimatedGasPrice;
  console.log(`
  estimatedGas: ${formatNumberWithCommas(Number(estimatedGas))} units
  estimatedGasPrice: ${ethers.formatUnits(estimatedGasPrice, "gwei")} Gwei
  estimatedTransactionFee: ${ethers.formatEther(estimatedTransactionFee)} ETH
  `);

  const prompt = require("prompt-sync")();
  const response = prompt("Do you want to continue? (y/n): ");
  if (response !== "y") {
    console.log("Exiting script");
    process.exit(0);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
