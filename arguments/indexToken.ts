import { ethers } from "hardhat";
import { MyAddr, avalancheTestnetRealToken, toE18, toE } from "../constant";

const components = {
  A: { addr: avalancheTestnetRealToken.tokenA, unit: 25e18 },
  B: { addr: avalancheTestnetRealToken.tokenB, unit: 75e6 },
}

// module.exports = [
//   [components.A.addr, components.B.addr],
//   [components.A.unit, components.B.unit],
//   [toE18(25), toE18(75)],
//   MyAddr,
//   "FirstIndex",
//   "IDX",
//   "0x5166e01ff55bC806E7bCF4eac70aF154174f0dBf" // 
// ];


module.exports = [
  ["0xd00ae08403B9bbb9124bB305C09058E32C39A48c", "0xB6076C93701D6a07266c31066B298AeC6dd65c2d"],
  [ethers.utils.parseUnits("1.673994362323798724",18), ethers.utils.parseUnits("14.999944",18)],
  [toE18(70), toE(30,6)],
  "0xA4C7b6667527B65Ff554dE9f89cbFA0098624BA6",
  "My Token Index",
  "MTI",
  "0xb1aAAfbC0E6c358441FA8C8BBA00EE31583f971A"
]