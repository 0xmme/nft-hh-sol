import { ethers, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { devChains, networkConfig } from "../helper-hardhat-config";
import { storeNFTs } from "../utils/uploadToNftStorage";
import verify from "../utils/verify/verify";
import "dotenv/config";
import { VRFConsumerBaseV2, VRFCoordinatorV2Mock } from "../typechain-types";

const deployRandomIpfsNft: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  // env variables
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("------- RandomIpfsNft deployment started --------");

  let vrfCoordinatorV2Address: string;
  let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
  let subscriptionId;
  const gasLane: string = networkConfig[network.name].gasLane!;
  const callbackGasLimit: number =
    networkConfig[network.name].callbackGasLimit!;

  if (devChains.includes(network.name)) {
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events![0].args!.subId;

    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      ethers.utils.parseEther("1")
    );
  } else {
    vrfCoordinatorV2Address = networkConfig[network.name].vrfCoordinatorV2!;
    vrfCoordinatorV2Mock = await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      vrfCoordinatorV2Address
    );
    subscriptionId = networkConfig[network.name].subscriptionId!;
  }

  const imgPath = "./images/random";
  let tokenUris: any[];

  const mintfee = ethers.utils.parseEther(networkConfig[network.name].mintFee!);

  if (process.env.UPLOAD_TO_NFTSTORAGE === "1") {
    log("------- Upload to IPFS started --------");
    const tokenUrisRAW = await handleTokenUris(imgPath);
    let tempArr = [];
    for (let i = 0; i < tokenUrisRAW.length; i++) {
      tempArr.push(tokenUrisRAW[i].url);
    }
    tokenUris = tempArr;
    console.log(tokenUris);
  } else {
    tokenUris = [
      "ipfs://bafyreiflh4wjd2shgk2kguff5gl5uv6ifpdszfgfep2itve3tdzqugx7mu/metadata.json",
      "ipfs://bafyreifto6b6mnmdldfgjdnl7s4xtqiy2y3sxdzeofto4t7kabirethnqa/metadata.json",
      "ipfs://bafyreiba3gghrjx7tyxlomgt3y772wdnts5sz4hrf5esddkka42w7o22be/metadata.json",
      //"ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
      //"ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
      //"ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
    ];
  }

  const args: any[] = [
    vrfCoordinatorV2Address,
    subscriptionId,
    gasLane,
    callbackGasLimit,
    tokenUris,
    mintfee,
  ];

  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });

  await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address);

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
