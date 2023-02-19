#!/usr/bin/env bash

controller=$1
multiAssetSwapper=$2
indexTokenFactory=$3
dcaManager=$4
router=$5
wavax=$6
deployer=$7

npx hardhat verify --network fuji $indexTokenFactory $controller
npx hardhat verify --network fuji $controller
npx hardhat verify --network fuji $multiAssetSwapper $router $wavax
npx hardhat verify --network fuji $dcaManager $deployer $controller

# multi 0xbc28aBf7dA90235E63E22303E1DFa98b7e29Ea47
# controller 0x7841a92e43dce8ba861941b62fde6da39a174ae5
# factory 0xae7b1530cb79748c878f44fe7e8289f09c9edb45
# dca 0x3565f9d91848acca3b1b60a24ce3104f614b9e9c

# 0x7841a92e43dce8ba861941b62fde6da39a174ae5 0xbc28aBf7dA90235E63E22303E1DFa98b7e29Ea47 0xae7b1530cb79748c878f44fe7e8289f09c9edb45 0x3565f9d91848acca3b1b60a24ce3104f614b9e9c 0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901 0xd00ae08403B9bbb9124bB305C09058E32C39A48c 0x4A4803Ce8E17aC61F82312Ed4e3a43291c10f76d