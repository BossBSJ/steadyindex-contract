import { expect } from "chai";
import { DCAManager, IndexToken } from "../typechain-types";
import { centralFixture } from "./shares/fixtures";
import { avalanche, toE, toE18 } from "../constant";
import { BigNumber } from "ethers";
import { IDCAManager } from "../typechain-types/contracts/DCAManager";

describe("DACManager", () => {
  let dcaManager: DCAManager;
  let account: string;
  let indexToken: IndexToken;
  let addresses: typeof avalanche;
  let getTokensBalanceOf: (
    tokenAddrs: string[],
    accountAddr?: string
  ) => Promise<BigNumber[]>;

  before(async () => {
    const fixture = await centralFixture();
    fixture.autoSwapIfNoBalance();

    dcaManager = fixture.dcaManager;
    account = fixture.deployer.address;
    addresses = fixture.addresses;
    getTokensBalanceOf = fixture.getTokensBalanceOf;

    await fixture.initController();
    await fixture.createDefaultIndex();
    indexToken = await fixture.getIndexToken();

    await Promise.all(
      [addresses.tokenC, indexToken.address].map((addr) =>
        fixture.addrApproveTokenForSpender(
          addr,
          dcaManager.address,
          toE18(10000000).toString()
        )
      )
    );
  });

  it("unsubscription", async () => {
    let investments: IDCAManager.InvestmentStructOutput[];
    investments = await dcaManager.InvestmentsForAccount(account);
    expect(investments.length, "investment length 1").to.equal(0);
    
    await dcaManager.subscription(
      account,
      indexToken.address,
      toE18(1),
      addresses.tokenC,
      1000,
      100
      );
      
      investments = await dcaManager.InvestmentsForAccount(account);
      expect(investments.length, "investment length 2").to.equal(1);

    await dcaManager.unsubscription(0);

    investments = await dcaManager.InvestmentsForAccount(account);
    expect(investments.length, "investment length 3").to.equal(0);

    await dcaManager.subscription(
      account,
      indexToken.address,
      toE18(1),
      addresses.tokenC,
      1000,
      1
    );
    await dcaManager.subscription(
      account,
      indexToken.address,
      toE18(1),
      addresses.tokenC,
      1000,
      2
    );
    await dcaManager.subscription(
      account,
      indexToken.address,
      toE18(1),
      addresses.tokenC,
      1000,
      3
    );

    investments = await dcaManager.InvestmentsForAccount(account);
    expect(investments.length, "investment length 4").to.equal(3);
    expect(investments[0].cycle, "check cycle 1").to.equal(1);
    expect(investments[1].cycle, "check cycle 2").to.equal(2);
    expect(investments[2].cycle, "check cycle 3").to.equal(3);

    await dcaManager.unsubscription(1);
    investments = await dcaManager.InvestmentsForAccount(account);
    expect(investments[0].cycle, "check cycle 4").to.equal(1);
    expect(investments[1].cycle, "check cycle 5").to.equal(3);

    await dcaManager.unsubscription(1);
    investments = await dcaManager.InvestmentsForAccount(account);
    expect(investments.length, "investment length 5").to.equal(1);
    expect(investments[0].cycle, "check cycle 6").to.equal(1);

    await dcaManager.unsubscription(0);
    investments = await dcaManager.InvestmentsForAccount(account);
    expect(investments.length, "investment length 7").to.equal(0);
  });

  it("subscript", async () => {
    const [_indexBal] = await getTokensBalanceOf([indexToken.address], account);

    const _investments = await dcaManager.InvestmentsForAccount(account);
    expect(_investments.length, "investment length 1").to.equal(0);

    await dcaManager.subscription(
      account,
      indexToken.address,
      toE18(1),
      addresses.tokenC,
      1000,
      100
    );

    const investments = await dcaManager.InvestmentsForAccount(account);
    expect(investments.length, "investment length 2").to.equal(1);

    const [indexBal] = await getTokensBalanceOf([indexToken.address], account);
    expect(indexBal, "indexToken balance").to.equal(_indexBal.add(toE18(1)));
  });
});
