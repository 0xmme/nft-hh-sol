import { ethers, deployments, network } from "hardhat";
import { BasicNft } from "../typechain-types";
import { Signer } from "ethers";
import { devChains } from "../helper-hardhat-config";
import assert from "assert";

!devChains.includes(network.name)
  ? describe.skip
  : describe("BasicNft", function () {
      let basicNft: BasicNft;
      let deployer: Signer;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];

        await deployments.fixture(["all"]);

        basicNft = await ethers.getContract("BasicNft", deployer);
      });

      it("should mint a NFT upon request", async () => {
        const tx = await basicNft.mintNft();
        await tx.wait(1);

        const tokenUri = await basicNft.tokenURI(0);
        const tokenCount = await basicNft.getTokenCount();

        assert.equal(tokenCount.toString(), "1");
        assert.equal(await basicNft.TOKEN_URI(), tokenUri);
      });
    });
