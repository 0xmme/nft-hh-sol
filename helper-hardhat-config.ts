/* eslint-disable node/no-unpublished-import */
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export interface networkConfigItem {
  vrfCoordinatorV2?: string;
  usdEthPriceFeed?: string;
  blockConfirmations?: number;
  entranceFee?: BigNumber;
  gasLane?: string;
  subscriptionId?: number;
  callbackGasLimit?: number;
  raffleInterval?: number;
  mintFee?: string;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  localhost: {
    blockConfirmations: 1,
    entranceFee: ethers.utils.parseEther("1"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: 0,
    callbackGasLimit: 500000,
    raffleInterval: 30,
    mintFee: "0.001",
  },
  hardhat: {
    blockConfirmations: 1,
    entranceFee: ethers.utils.parseEther("1"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: 0,
    callbackGasLimit: 500000,
    raffleInterval: 30,
    mintFee: "0.001",
  },
  goerli: {
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    blockConfirmations: 6,
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    mintFee: "0.001",
    subscriptionId: 6076,
    callbackGasLimit: 500000,
    raffleInterval: 30,
    usdEthPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};

export const devChains = ["hardhat", "localhost"];
export const DECIMALS = 8;
export const INITIAL_ANSWER = 200000000000;
