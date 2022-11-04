import { ethers, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { devChains, networkConfig } from "../helper-hardhat-config";
import { storeNFTs } from "../utils/uploadToNftStorage";
import verify from "../utils/verify/verify";
import "dotenv/config";

const deployRandomIpfsNft: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  // env variables
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("------- mock deployment started --------");

  let vrfCoordinatorV2Address: string;
  let subscriptionId;
  const gasLane: string = networkConfig[network.name].gasLane!;
  const callbackGasLimit: number =
    networkConfig[network.name].callbackGasLimit!;

  if (devChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
  } else {
    vrfCoordinatorV2Address = networkConfig[network.name].vrfCoordinatorV2!;
    subscriptionId = networkConfig[network.name].subscriptionId!;
  }

  log("------- mocks deployed --------");

  log("------- NFT deployment started --------");

  const imgPath = "../images/random";
  let tokenUris: any[] | void;

  if (process.env.UPLOAD_TO_NFTSTORAGE) {
    log("------- Upload to IPFS started --------");
    tokenUris = await handleTokenUris(imgPath);
  }

  const args: any[] = [
    vrfCoordinatorV2Address,
    subscriptionId,
    gasLane,
    callbackGasLimit,
    // tokenURI[]
    networkConfig[network.name].mintFee,
  ];

  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  if (!devChains.includes(network.name)) {
    log("------- verifying started --------");
    await verify(randomIpfsNft.address, args);
  }
};

const handleTokenUris = async (path: string) => {
  const response = await storeNFTs(path);
  return response;
};

export default deployRandomIpfsNft;

deployRandomIpfsNft.tags = ["all", "randomipfs"];
