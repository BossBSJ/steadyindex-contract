import { time } from "@nomicfoundation/hardhat-network-helpers";

async function main() {

    console.log("runing block timestamp.")
    const timestampInSeccond = Number((Date.now() / 1000).toFixed(0))

    await time.increaseTo(timestampInSeccond)
    setInterval(async () => {
        await time.increase(1)

    }, 1000)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});