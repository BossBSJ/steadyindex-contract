#!/usr/bin/env bash

controller=$1
multiAssetSwapper=$2
indexTokenFactory=$3
uniRouter="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"

npx hardhat verify --network goerli $indexTokenFactory $controller
npx hardhat verify --network goerli $controller
npx hardhat verify --network goerli $multiAssetSwapper $uniRouter $controller

