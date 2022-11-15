import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { Address } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { devChains, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify/verify";
import fs from "fs";

const deployDynamicSvgNft: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  // env variables
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();

  log("------- DynamicSvgNft deployment started --------");

  let ethUsdPriceFeedAddress: Address;

  if (devChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[network.name].usdEthPriceFeed!;
  }

  const lowSvgImg = fs.readFileSync("./images/dynamicsvg/frown.svg", {
    encoding: "utf8",
  });
  const highSvgImg = fs.readFileSync("./images/dynamicsvg/happy.svg", {
    encoding: "utf8",
  });

  const args: any[] = [highSvgImg, lowSvgImg, ethUsdPriceFeedAddress];

  const dynamicSvgNft = await deploy("DynamicSvgNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  if (!devChains.includes(network.name)) {
    log("------- verifying started --------");
    await verify(dynamicSvgNft.address, args);
  }
};

export default deployDynamicSvgNft;

deployDynamicSvgNft.tags = ["all", "dynamicnft"];
