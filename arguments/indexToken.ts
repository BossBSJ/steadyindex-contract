import { MyAddr, avalancheTestnetRealToken, toE18 } from "../constant";

const components = {
  A: { addr: avalancheTestnetRealToken.tokenA, unit: 25e6 },
  B: { addr: avalancheTestnetRealToken.tokenB, unit: 75e6 },
}

module.exports = [
  [components.A.addr, components.B.addr],
  [components.A.unit, components.B.unit],
  [toE18(25), toE18(75)],
  MyAddr,
  "FirstIndex",
  "IDX",
  "0x5166e01ff55bC806E7bCF4eac70aF154174f0dBf" // 
];
