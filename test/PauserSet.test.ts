import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { PauserSet } from "../typechain-types";

describe("PauserSet", function () {
  let pauserSet: PauserSet;
  let deployer: SignerWithAddress;
  let pauser1: SignerWithAddress;
  let pauser2: SignerWithAddress;
  let pauser3: SignerWithAddress;
  let nonPauser: SignerWithAddress;

  beforeEach(async function () {
    [deployer, pauser1, pauser2, pauser3, nonPauser] =
      await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should deploy with single pauser", async function () {
      const PauserSetFactory = await ethers.getContractFactory("PauserSet");
      pauserSet = await PauserSetFactory.deploy([pauser1.address]);
      await pauserSet.waitForDeployment();

      expect(await pauserSet.getPauserCount()).to.equal(1);
      expect(await pauserSet.isPauser(pauser1.address)).to.be.true;
    });

    it("Should deploy with multiple pausers", async function () {
      const PauserSetFactory = await ethers.getContractFactory("PauserSet");
      pauserSet = await PauserSetFactory.deploy([
        pauser1.address,
        pauser2.address,
        pauser3.address,
      ]);
      await pauserSet.waitForDeployment();

      expect(await pauserSet.getPauserCount()).to.equal(3);
      expect(await pauserSet.isPauser(pauser1.address)).to.be.true;
      expect(await pauserSet.isPauser(pauser2.address)).to.be.true;
      expect(await pauserSet.isPauser(pauser3.address)).to.be.true;
    });

    it("Should emit PauserAdded events", async function () {
      const PauserSetFactory = await ethers.getContractFactory("PauserSet");
      const pauserSetInstance = await PauserSetFactory.deploy([pauser1.address, pauser2.address]);
      const deployReceipt = await pauserSetInstance.deploymentTransaction()?.wait();

      // Check that PauserAdded events were emitted
      const events = deployReceipt?.logs.filter(
        (log: any) => {
          try {
            const parsed = pauserSetInstance.interface.parseLog(log);
            return parsed?.name === "PauserAdded";
          } catch {
            return false;
          }
        }
      );

      expect(events?.length).to.equal(2);
    });

    it("Should fail with empty pauser array", async function () {
      const PauserSetFactory = await ethers.getContractFactory("PauserSet");
      await expect(PauserSetFactory.deploy([])).to.be.revertedWith(
        "At least one pauser required"
      );
    });

    it("Should fail with zero address pauser", async function () {
      const PauserSetFactory = await ethers.getContractFactory("PauserSet");
      await expect(
        PauserSetFactory.deploy([pauser1.address, ethers.ZeroAddress])
      ).to.be.revertedWith("Invalid pauser address");
    });

    it("Should fail with duplicate pausers", async function () {
      const PauserSetFactory = await ethers.getContractFactory("PauserSet");
      await expect(
        PauserSetFactory.deploy([pauser1.address, pauser1.address])
      ).to.be.revertedWith("Duplicate pauser address");
    });
  });

  describe("Pauser Verification", function () {
    beforeEach(async function () {
      const PauserSetFactory = await ethers.getContractFactory("PauserSet");
      pauserSet = await PauserSetFactory.deploy([
        pauser1.address,
        pauser2.address,
      ]);
      await pauserSet.waitForDeployment();
    });

    it("Should correctly identify authorized pausers", async function () {
      expect(await pauserSet.isAuthorizedPauser(pauser1.address)).to.be.true;
      expect(await pauserSet.isAuthorizedPauser(pauser2.address)).to.be.true;
    });

    it("Should correctly identify non-pausers", async function () {
      expect(await pauserSet.isAuthorizedPauser(nonPauser.address)).to.be.false;
      expect(await pauserSet.isAuthorizedPauser(deployer.address)).to.be.false;
    });

    it("Should return all pausers", async function () {
      const pausers = await pauserSet.getPausers();
      expect(pausers.length).to.equal(2);
      expect(pausers[0]).to.equal(pauser1.address);
      expect(pausers[1]).to.equal(pauser2.address);
    });

    it("Should get pauser by index", async function () {
      expect(await pauserSet.pausers(0)).to.equal(pauser1.address);
      expect(await pauserSet.pausers(1)).to.equal(pauser2.address);
    });
  });

  describe("Immutability", function () {
    it("Should have immutable pauser list", async function () {
      const PauserSetFactory = await ethers.getContractFactory("PauserSet");
      pauserSet = await PauserSetFactory.deploy([pauser1.address]);
      await pauserSet.waitForDeployment();

      // Verify initial state
      expect(await pauserSet.getPauserCount()).to.equal(1);

      // Contract should have no functions to add/remove pausers after deployment
      const pauserSetInterface = pauserSet.interface;
      const addPauserFunction = pauserSetInterface.fragments.find(
        (f: any) => f.name === "addPauser"
      );
      const removePauserFunction = pauserSetInterface.fragments.find(
        (f: any) => f.name === "removePauser"
      );

      expect(addPauserFunction).to.be.undefined;
      expect(removePauserFunction).to.be.undefined;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum realistic number of pausers", async function () {
      // Create array of 10 unique addresses
      const signers = await ethers.getSigners();
      const manyPausers = signers.slice(0, 10).map((s) => s.address);

      const PauserSetFactory = await ethers.getContractFactory("PauserSet");
      pauserSet = await PauserSetFactory.deploy(manyPausers);
      await pauserSet.waitForDeployment();

      expect(await pauserSet.getPauserCount()).to.equal(10);

      // Verify all are authorized
      for (const pauser of manyPausers) {
        expect(await pauserSet.isAuthorizedPauser(pauser)).to.be.true;
      }
    });
  });
});
