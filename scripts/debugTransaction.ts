// import {etherscan} from "@nomiclabs/hardhat-etherscan";
import { ethers } from "hardhat";


async function debugTransaction(txHash:string) {
  const tx = await ethers.provider.getTransaction(txHash);
  console.log(tx);

  const txReceipt = await ethers.provider.getTransactionReceipt(txHash);
  console.log(txReceipt);

  const txDetails = await ethers.provider._getTransactionRequest(txHash);
  console.log(txDetails);
  
}

debugTransaction("0xf94ef5bb4726460b73c5460d420122261c7accb798952f600a634f69e76af90d");