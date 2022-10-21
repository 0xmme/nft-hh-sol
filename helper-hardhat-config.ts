/* eslint-disable node/no-unpublished-import */

export interface networkConfigItem {
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  localhost: {
    blockConfirmations: 1,
  },
  hardhat: {
    blockConfirmations: 1,
  },
  goerli: {
    blockConfirmations: 5,
  },
};

export const devChains = ["hardhat", "localhost"];
export const DECIMALS = 8;
export const INITIAL_ANSWER = 200000000000;
