import { MyAddr, avalancheTestnet, toE18 } from "../constant";

const components = {
  A: { addr: avalancheTestnet.tokenA, unit: 25e6 },
  B: { addr: avalancheTestnet.tokenB, unit: 75e6 },
};

module.exports = [
  [components.A.addr, components.B.addr],
  [components.A.unit, components.B.unit],
  [toE18(25), toE18(75)],
  MyAddr,
  "FirstIndex",
  "IDX",
  "0x7841a92e43dce8ba861941b62fde6da39a174ae5"
];
