import { DCAManager } from "../typechain-types"
import { centralFixture } from "./shares/fixtures";


describe('DACManager', () => { 
    let dcaManager: DCAManager

    before(async() => {
    const fixture = await centralFixture();
        dcaManager = fixture.dcaManager
    })

    it("subscript",async() => {
        
    })
 })