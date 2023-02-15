# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

to compile contract run code below
```shell
yarn
yarn compile
```
then lets verify contract. copy output log from above and run
```
./verify.sh <place 3 address here>
```

to get abi in each contract
```
/artifacts/contracts/<ContractName>/<ContractName>.json
```

