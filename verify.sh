#!/usr/bin/env bash

controller=$1
multiAssetSwapper=$2
indexTokenFactory=$3
dcaManager=$4
router=$5
wavax=$6
deployer=$7
fistIndexToken=$8

npx hardhat verify --network fuji $indexTokenFactory $controller
npx hardhat verify --network fuji $controller
npx hardhat verify --network fuji $multiAssetSwapper $router $wavax
npx hardhat verify --network fuji $dcaManager $deployer $controller
# npx hardhat verify --network fuji --constructor-args arguments/indexToken.ts $fistIndexToken

# multi 0x630C493737e5E046578aFD114726857F50EB5FB3
# controller 0x8906A7Fe69a0470b2Bf86BFe2e4A9acA0bF4a137
# factory 0x8137703bc25cB7C08C536eD4feCA68Dd7B7A3e7c
# dca 0x1642a285D72a60157FCbe2C572089BB06FA95C45

# 0x8906A7Fe69a0470b2Bf86BFe2e4A9acA0bF4a137 0x630C493737e5E046578aFD114726857F50EB5FB3 0x8137703bc25cB7C08C536eD4feCA68Dd7B7A3e7c 0x1642a285D72a60157FCbe2C572089BB06FA95C45 0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901 0xd00ae08403B9bbb9124bB305C09058E32C39A48c 0x4A4803Ce8E17aC61F82312Ed4e3a43291c10f76d