import { ethers, deployments, network } from "hardhat";
import { RandomIpfsNft } from "../../typechain-types";
import { Signer } from "ethers";
import { devChains, networkConfig } from "../../helper-hardhat-config";

import assert from "assert";

!devChains.includes(network.name)
  ? describe.skip
  : describe("RandomIpfsNft", function () {
      let RandomIpfsNft: RandomIpfsNft;
      let deployer: Signer;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];

        await deployments.fixture(["all"]);

        RandomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
      });

      it("should mint a NFT upon request", async () => {
        const tx = await RandomIpfsNft.requestNft({
          value: ethers.utils.parseEther(networkConfig[network.name].mintFee!),
        });
        await tx.wait(1);

        const tokenUri = await RandomIpfsNft.tokenURI(0);
        console.log(tokenUri);
        const tokenCount = await RandomIpfsNft.getTokenCount();

        assert.equal(tokenCount.toString(), "1");
      });
    });
