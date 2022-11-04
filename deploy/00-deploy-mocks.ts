/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction, DeployedContract } from "hardhat-deploy/types";
import { network, ethers } from "hardhat";
import { devChains, networkConfig } from "../helper-hardhat-config";
import { BigNumber } from "ethers";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (devChains.includes(network.name)) {
    log("local network detected... deploying Mocks...");

    const BASE_FEE: BigNumber = ethers.utils.parseEther("0.25");
    const GAS_PRICE_LINK = 1e9;
    const MockVrfCoordinatorV2: DeployedContract = await deploy(
      "VRFCoordinatorV2Mock",
      {
        from: deployer,
        args: [BASE_FEE, GAS_PRICE_LINK],
        log: true,
        waitConfirmations: Number(networkConfig.blockConfirmations) || 1,
      }
    );
    log(`Mock VRFCoordinatorV2 deployed at ${MockVrfCoordinatorV2.address}`);
    log("-------------------------------------------------");
  }
};

export default deployFunc;

deployFunc.tags = ["all", "mocks"];
