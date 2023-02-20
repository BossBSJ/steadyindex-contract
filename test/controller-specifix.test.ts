import { expect } from "chai";
import { ethers } from "hardhat";
import { centralFixture } from "./shares/fixtures";
import { avalancheTestnetRealToken } from "../constant";

describe("controller case - specific", () => {
  // it("issue", async () => {
  //   const controller = await ethers.getContractAt(
  //     "Controller",
  //     "0x1d5518120bef0b4dfa934bc53e68f09062f40ecd"
  //   );
  //   await controller.issueIndexToken(
  //     "0x2526a2077F797484408F8Bdf29c108150926DD12",
  //     "10000000000000000",
  //     "0xB6076C93701D6a07266c31066B298AeC6dd65c2d",
  //     "0x4A4803Ce8E17aC61F82312Ed4e3a43291c10f76d"
  //   );
  //   // expect(false, "xxx");
  // });

  it.skip("issue local", async () => {
    const fixture = await centralFixture(avalancheTestnetRealToken);

    await fixture.initController();

    await fixture.indexTokenFactory.createIndexToken(
      [
        "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
        "0xB6076C93701D6a07266c31066B298AeC6dd65c2d",
      ],
      ["1818597231049823515", "37391286"],
      ["50000000000000000000", "50000000000000000000"],
      fixture.deployer.address,
      "firstToken",
      "fIDX"
    );

    const fIndex = await fixture.getIndexToken(0);

    await fixture.addrApproveTokenForSpender(
      '0xB6076C93701D6a07266c31066B298AeC6dd65c2d',
      fixture.controller.address,
      "10000000000000000000000000"
    );

    await fixture.controller.issueIndexToken(
      fIndex.address,
      "10000000000000000",
      "0xB6076C93701D6a07266c31066B298AeC6dd65c2d",
      "0x4A4803Ce8E17aC61F82312Ed4e3a43291c10f76d"
    );

    expect(false, "xxx");
  });
});
