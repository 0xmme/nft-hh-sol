import { ethers, deployments, network } from "hardhat";
import { RandomIpfsNft, VRFCoordinatorV2Mock } from "../../typechain-types";
import { BigNumber, Signer } from "ethers";
import { devChains, networkConfig } from "../../helper-hardhat-config";

import assert from "assert";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { randomBytes } from "crypto";

!devChains.includes(network.name)
  ? describe.skip
  : describe("RandomIpfsNft", function () {
      let RandomIpfsNft: RandomIpfsNft;
      let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
      let deployer: Signer;

      beforeEach(async () => {
        const accounts: SignerWithAddress[] = await ethers.getSigners();
        deployer = accounts[0];

        await deployments.fixture(["all"]);

        RandomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });

      describe("constructor", () => {
        it("should construct properly", async () => {
          const tokenURIs: string[] = await RandomIpfsNft.getTokenUriList();
          assert(tokenURIs[0].includes("ipfs://"));
        });
      });

      describe("requestNft", () => {
        it("should revert if mintfee is not paid", async () => {
          await expect(RandomIpfsNft.requestNft()).to.be.revertedWith(
            "min mintfee not paid"
          );
        });

        it("should request a NFT when correct mintfee is paid", async () => {
          const mintFee: BigNumber = await RandomIpfsNft.getMintFee();
          const tx = await RandomIpfsNft.requestNft({
            value: mintFee,
          });
          await tx.wait(1);

          await expect(
            RandomIpfsNft.requestNft({
              value: mintFee,
            })
          ).to.emit(RandomIpfsNft, "RequestSent");
        });
      });

      describe("fullfillRandomWords", () => {
        it("should mint a NFT, once randomWords are returned", async () => {
          await new Promise<void>(async (resolve, reject) => {
            try {
              const mintFee: BigNumber = await RandomIpfsNft.getMintFee();

              const tx = await RandomIpfsNft.requestNft({
                value: mintFee,
              });
              const txr = await tx.wait(1);

              const requestId = txr.events![1].args!.requestId;

              await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestId,
                RandomIpfsNft.address
              );
            } catch (error) {
              reject(error);
            }

            RandomIpfsNft.once("NFTMinted", async () => {
              try {
                const tokenCount = await RandomIpfsNft.getTokenCount();
                assert.equal(tokenCount.toString(), "1");
                const tokenURI = await RandomIpfsNft.tokenURI("0");
                assert(tokenURI.toString().includes("ipfs://"));
                resolve();
              } catch (error) {
                reject(error);
              }
            });
          });
        });
      });

      describe("withdraw", () => {
        it("should withdraw all funds to owner", async () => {
          const mintFee: BigNumber = await RandomIpfsNft.getMintFee();
          const tx = await RandomIpfsNft.requestNft({
            value: mintFee,
          });

          await tx.wait(1);
          const balAfterMint = await deployer.getBalance();

          const txW = await RandomIpfsNft.withdraw();
          await txW.wait(1);

          const balAfterWithdraw = await deployer.getBalance();
          expect(balAfterWithdraw).to.be.greaterThan(balAfterMint);
        });
      });
    });
