import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { PrivateVehicleInsurance, PauserSet } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("PrivateVehicleInsurance", function () {
  let insurance: PrivateVehicleInsurance;
  let pauserSet: PauserSet;
  let deployer: SignerWithAddress;
  let insuranceCompany: SignerWithAddress;
  let policyHolder: SignerWithAddress;
  let reviewer: SignerWithAddress;
  let pauser: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [deployer, insuranceCompany, policyHolder, reviewer, pauser, other] =
      await ethers.getSigners();

    // Deploy PauserSet
    const PauserSetFactory = await ethers.getContractFactory("PauserSet");
    pauserSet = await PauserSetFactory.deploy([pauser.address]);
    await pauserSet.waitForDeployment();

    // Deploy PrivateVehicleInsurance
    const InsuranceFactory = await ethers.getContractFactory(
      "PrivateVehicleInsurance"
    );
    insurance = await InsuranceFactory.connect(insuranceCompany).deploy(
      await pauserSet.getAddress()
    );
    await insurance.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct insurance company", async function () {
      expect(await insurance.insuranceCompany()).to.equal(
        insuranceCompany.address
      );
    });

    it("Should set the correct PauserSet contract", async function () {
      expect(await insurance.pauserSetContract()).to.equal(
        await pauserSet.getAddress()
      );
    });

    it("Should start unpaused", async function () {
      expect(await insurance.isPaused()).to.be.false;
    });

    it("Should initialize policy and claim counters", async function () {
      expect(await insurance.nextPolicyId()).to.equal(1);
      expect(await insurance.nextClaimId()).to.equal(1);
    });

    it("Should fail with invalid PauserSet address", async function () {
      const InsuranceFactory = await ethers.getContractFactory(
        "PrivateVehicleInsurance"
      );
      await expect(
        InsuranceFactory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid PauserSet address");
    });
  });

  describe("Policy Creation", function () {
    it("Should create a policy with encrypted data", async function () {
      const tx = await insurance
        .connect(policyHolder)
        .createPolicy(30, 10, 25000, 1200);

      await expect(tx)
        .to.emit(insurance, "PolicyCreated")
        .withArgs(1, policyHolder.address);

      const policy = await insurance.policies(1);
      expect(policy.holderAddress).to.equal(policyHolder.address);
      expect(policy.isActive).to.be.true;
    });

    it("Should increment policy ID", async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);
      expect(await insurance.nextPolicyId()).to.equal(2);

      await insurance.connect(other).createPolicy(25, 5, 20000, 1000);
      expect(await insurance.nextPolicyId()).to.equal(3);
    });

    it("Should track policies by holder", async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);
      await insurance.connect(policyHolder).createPolicy(35, 15, 30000, 1500);

      const policies = await insurance.getPoliciesByHolder(policyHolder.address);
      expect(policies.length).to.equal(2);
      expect(policies[0]).to.equal(1);
      expect(policies[1]).to.equal(2);
    });

    it("Should fail with invalid age", async function () {
      await expect(
        insurance.connect(policyHolder).createPolicy(17, 1, 25000, 1200)
      ).to.be.revertedWith("Invalid age");

      await expect(
        insurance.connect(policyHolder).createPolicy(101, 50, 25000, 1200)
      ).to.be.revertedWith("Invalid age");
    });

    it("Should fail with invalid driving years", async function () {
      await expect(
        insurance.connect(policyHolder).createPolicy(25, 20, 25000, 1200)
      ).to.be.revertedWith("Invalid driving years");
    });

    it("Should fail with zero vehicle value", async function () {
      await expect(
        insurance.connect(policyHolder).createPolicy(30, 10, 0, 1200)
      ).to.be.revertedWith("Vehicle value must be positive");
    });

    it("Should fail with zero premium", async function () {
      await expect(
        insurance.connect(policyHolder).createPolicy(30, 10, 25000, 0)
      ).to.be.revertedWith("Premium must be positive");
    });

    it("Should fail when contract is paused", async function () {
      // Pause contract
      const pauserSetAddress = await pauserSet.getAddress();
      await insurance.connect(pauser).pause();

      await expect(
        insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200)
      ).to.be.revertedWith("Contract is paused");
    });
  });

  describe("Claim Submission", function () {
    let policyId: bigint;

    beforeEach(async function () {
      const tx = await insurance
        .connect(policyHolder)
        .createPolicy(30, 10, 25000, 1200);
      const receipt = await tx.wait();
      policyId = 1n;
    });

    it("Should submit a claim with encrypted data", async function () {
      const tx = await insurance
        .connect(policyHolder)
        .submitClaim(
          policyId,
          5000,
          4500,
          1, // Moderate severity
          "QmTestHash123",
          true
        );

      await expect(tx)
        .to.emit(insurance, "ClaimSubmitted")
        .withArgs(1, policyId, policyHolder.address);

      const claim = await insurance.claims(1);
      expect(claim.policyId).to.equal(policyId);
      expect(claim.claimant).to.equal(policyHolder.address);
      expect(claim.status).to.equal(0); // Submitted
      expect(claim.severity).to.equal(1); // Moderate
      expect(claim.ipfsDocumentHash).to.equal("QmTestHash123");
      expect(claim.isConfidential).to.be.true;
    });

    it("Should track claims by holder", async function () {
      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 5000, 4500, 1, "QmHash1", true);

      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 3000, 2800, 0, "QmHash2", false);

      const claims = await insurance.getClaimsByHolder(policyHolder.address);
      expect(claims.length).to.equal(2);
      expect(claims[0]).to.equal(1);
      expect(claims[1]).to.equal(2);
    });

    it("Should fail with zero damage amount", async function () {
      await expect(
        insurance
          .connect(policyHolder)
          .submitClaim(policyId, 0, 4500, 1, "QmHash", true)
      ).to.be.revertedWith("Damage amount must be positive");
    });

    it("Should fail with zero repair cost", async function () {
      await expect(
        insurance
          .connect(policyHolder)
          .submitClaim(policyId, 5000, 0, 1, "QmHash", true)
      ).to.be.revertedWith("Repair cost must be positive");
    });

    it("Should fail with empty document hash", async function () {
      await expect(
        insurance
          .connect(policyHolder)
          .submitClaim(policyId, 5000, 4500, 1, "", true)
      ).to.be.revertedWith("Document hash required");
    });

    it("Should fail if not policy holder", async function () {
      await expect(
        insurance
          .connect(other)
          .submitClaim(policyId, 5000, 4500, 1, "QmHash", true)
      ).to.be.revertedWith("Not policy holder");
    });

    it("Should test all accident severity levels", async function () {
      // Minor
      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 1000, 900, 0, "QmHash1", false);

      // Moderate
      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 5000, 4500, 1, "QmHash2", false);

      // Major
      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 15000, 14000, 2, "QmHash3", true);

      // Severe
      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 24000, 23000, 3, "QmHash4", true);

      expect(await insurance.nextClaimId()).to.equal(5);
    });
  });

  describe("Claim Review", function () {
    let policyId: bigint;
    let claimId: bigint;

    beforeEach(async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);
      policyId = 1n;

      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 5000, 4500, 1, "QmHash", true);
      claimId = 1n;

      // Authorize reviewer
      await insurance
        .connect(insuranceCompany)
        .authorizeReviewer(reviewer.address);
    });

    it("Should allow insurance company to review claim", async function () {
      const tx = await insurance
        .connect(insuranceCompany)
        .reviewClaim(claimId, 4800, 4500, "Approved after inspection", 2); // Approved

      await expect(tx).to.emit(insurance, "ClaimReviewed");
      await expect(tx).to.emit(insurance, "ClaimApproved").withArgs(claimId, 4500);

      const claim = await insurance.claims(claimId);
      expect(claim.status).to.equal(2); // Approved
    });

    it("Should allow authorized reviewer to review claim", async function () {
      const tx = await insurance
        .connect(reviewer)
        .reviewClaim(claimId, 4800, 4500, "Looks good", 2);

      await expect(tx).to.emit(insurance, "ClaimReviewed");

      const review = await insurance.claimReviews(claimId);
      expect(review.reviewer).to.equal(reviewer.address);
      expect(review.reviewNotes).to.equal("Looks good");
    });

    it("Should fail if reviewer is not authorized", async function () {
      await expect(
        insurance
          .connect(other)
          .reviewClaim(claimId, 4800, 4500, "Notes", 2)
      ).to.be.revertedWith("Not authorized reviewer");
    });

    it("Should fail for non-existent claim", async function () {
      await expect(
        insurance
          .connect(insuranceCompany)
          .reviewClaim(999, 4800, 4500, "Notes", 2)
      ).to.be.revertedWith("Claim does not exist");
    });

    it("Should fail with zero assessed damage", async function () {
      await expect(
        insurance
          .connect(insuranceCompany)
          .reviewClaim(claimId, 0, 4500, "Notes", 2)
      ).to.be.revertedWith("Assessed damage must be positive");
    });

    it("Should reject a claim", async function () {
      const tx = await insurance
        .connect(insuranceCompany)
        .reviewClaim(claimId, 5000, 0, "Claim rejected - fraud detected", 3); // Rejected

      const claim = await insurance.claims(claimId);
      expect(claim.status).to.equal(3); // Rejected
    });

    it("Should not allow reverting to submitted status", async function () {
      await expect(
        insurance
          .connect(insuranceCompany)
          .reviewClaim(claimId, 4800, 4500, "Notes", 0)
      ).to.be.revertedWith("Cannot revert to submitted");
    });
  });

  describe("Payment Processing", function () {
    let claimId: bigint;

    beforeEach(async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);
      await insurance
        .connect(policyHolder)
        .submitClaim(1, 5000, 4500, 1, "QmHash", true);
      claimId = 1n;

      // Approve the claim
      await insurance
        .connect(insuranceCompany)
        .reviewClaim(claimId, 4800, 4500, "Approved", 2);
    });

    it("Should process payment for approved claim", async function () {
      const tx = await insurance
        .connect(insuranceCompany)
        .processPayment(claimId);

      await expect(tx)
        .to.emit(insurance, "ClaimPaid")
        .withArgs(claimId, policyHolder.address);

      const claim = await insurance.claims(claimId);
      expect(claim.status).to.equal(4); // Paid
    });

    it("Should fail if claim not approved", async function () {
      // Submit new claim that's not approved
      await insurance
        .connect(policyHolder)
        .submitClaim(1, 3000, 2800, 0, "QmHash2", false);

      await expect(
        insurance.connect(insuranceCompany).processPayment(2)
      ).to.be.revertedWith("Claim not approved");
    });

    it("Should fail if not insurance company", async function () {
      await expect(
        insurance.connect(other).processPayment(claimId)
      ).to.be.revertedWith("Not authorized insurance company");
    });
  });

  describe("Risk Score Calculation", function () {
    it("Should calculate risk score with FHE operations", async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);

      const riskScore = await insurance.calculateRiskScore(1);
      expect(riskScore).to.not.equal(ethers.ZeroHash);
    });

    it("Should fail for inactive policy", async function () {
      await expect(insurance.calculateRiskScore(999)).to.be.reverted;
    });
  });

  describe("Reviewer Management", function () {
    it("Should authorize a reviewer", async function () {
      const tx = await insurance
        .connect(insuranceCompany)
        .authorizeReviewer(reviewer.address);

      await expect(tx)
        .to.emit(insurance, "ReviewerAuthorized")
        .withArgs(reviewer.address);

      expect(await insurance.authorizedReviewers(reviewer.address)).to.be.true;
    });

    it("Should revoke a reviewer", async function () {
      await insurance
        .connect(insuranceCompany)
        .authorizeReviewer(reviewer.address);

      const tx = await insurance
        .connect(insuranceCompany)
        .revokeReviewer(reviewer.address);

      await expect(tx)
        .to.emit(insurance, "ReviewerRevoked")
        .withArgs(reviewer.address);

      expect(await insurance.authorizedReviewers(reviewer.address)).to.be.false;
    });

    it("Should fail to authorize zero address", async function () {
      await expect(
        insurance.connect(insuranceCompany).authorizeReviewer(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid reviewer address");
    });

    it("Should fail to authorize already authorized reviewer", async function () {
      await insurance
        .connect(insuranceCompany)
        .authorizeReviewer(reviewer.address);

      await expect(
        insurance.connect(insuranceCompany).authorizeReviewer(reviewer.address)
      ).to.be.revertedWith("Reviewer already authorized");
    });

    it("Should fail to revoke non-authorized reviewer", async function () {
      await expect(
        insurance.connect(insuranceCompany).revokeReviewer(reviewer.address)
      ).to.be.revertedWith("Reviewer not authorized");
    });

    it("Should fail if not insurance company", async function () {
      await expect(
        insurance.connect(other).authorizeReviewer(reviewer.address)
      ).to.be.revertedWith("Not authorized insurance company");
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause contract from authorized pauser", async function () {
      const tx = await insurance.connect(pauser).pause();

      await expect(tx)
        .to.emit(insurance, "ContractPaused")
        .withArgs(pauser.address);

      expect(await insurance.isPaused()).to.be.true;
    });

    it("Should unpause contract", async function () {
      await insurance.connect(pauser).pause();

      const tx = await insurance.connect(pauser).unpause();

      await expect(tx)
        .to.emit(insurance, "ContractUnpaused")
        .withArgs(pauser.address);

      expect(await insurance.isPaused()).to.be.false;
    });

    it("Should fail to pause if not authorized", async function () {
      await expect(insurance.connect(other).pause()).to.be.revertedWith(
        "Not authorized pauser"
      );
    });

    it("Should fail to pause when already paused", async function () {
      await insurance.connect(pauser).pause();

      await expect(insurance.connect(pauser).pause()).to.be.revertedWith(
        "Already paused"
      );
    });

    it("Should fail to unpause when not paused", async function () {
      await expect(insurance.connect(pauser).unpause()).to.be.revertedWith(
        "Not paused"
      );
    });

    it("Should check if pause is allowed", async function () {
      expect(await insurance.isPauseAllowed()).to.be.true;

      await insurance.connect(pauser).pause();
      expect(await insurance.isPauseAllowed()).to.be.false;
    });
  });

  describe("Claim Details Access Control", function () {
    let claimId: bigint;

    beforeEach(async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);
      await insurance
        .connect(policyHolder)
        .submitClaim(1, 5000, 4500, 1, "QmConfidentialHash", true);
      claimId = 1n;

      await insurance
        .connect(insuranceCompany)
        .authorizeReviewer(reviewer.address);
    });

    it("Should allow claimant to view claim details", async function () {
      const details = await insurance
        .connect(policyHolder)
        .getClaimDetails(claimId);

      expect(details.claimant).to.equal(policyHolder.address);
      expect(details.documentHash).to.equal("QmConfidentialHash");
      expect(details.isConfidential).to.be.true;
    });

    it("Should allow insurance company to view claim details", async function () {
      const details = await insurance
        .connect(insuranceCompany)
        .getClaimDetails(claimId);

      expect(details.claimant).to.equal(policyHolder.address);
    });

    it("Should allow authorized reviewer to view claim details", async function () {
      const details = await insurance.connect(reviewer).getClaimDetails(claimId);

      expect(details.claimant).to.equal(policyHolder.address);
    });

    it("Should fail for unauthorized user", async function () {
      await expect(
        insurance.connect(other).getClaimDetails(claimId)
      ).to.be.revertedWith("Not authorized to view claim details");
    });
  });

  describe("Insurance Company Update", function () {
    it("Should update insurance company address", async function () {
      await insurance
        .connect(insuranceCompany)
        .updateInsuranceCompany(other.address);

      expect(await insurance.insuranceCompany()).to.equal(other.address);
    });

    it("Should fail with zero address", async function () {
      await expect(
        insurance
          .connect(insuranceCompany)
          .updateInsuranceCompany(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid company address");
    });

    it("Should fail if not current insurance company", async function () {
      await expect(
        insurance.connect(other).updateInsuranceCompany(other.address)
      ).to.be.revertedWith("Not authorized insurance company");
    });
  });

  describe("Complex Scenarios", function () {
    it("Should handle multiple policies and claims for same holder", async function () {
      // Create 3 policies
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);
      await insurance.connect(policyHolder).createPolicy(35, 15, 30000, 1500);
      await insurance.connect(policyHolder).createPolicy(40, 20, 35000, 1800);

      // Submit claims for each policy
      await insurance
        .connect(policyHolder)
        .submitClaim(1, 5000, 4500, 1, "QmHash1", true);
      await insurance
        .connect(policyHolder)
        .submitClaim(2, 3000, 2800, 0, "QmHash2", false);
      await insurance
        .connect(policyHolder)
        .submitClaim(3, 15000, 14000, 2, "QmHash3", true);

      const policies = await insurance.getPoliciesByHolder(policyHolder.address);
      const claims = await insurance.getClaimsByHolder(policyHolder.address);

      expect(policies.length).to.equal(3);
      expect(claims.length).to.equal(3);
    });

    it("Should handle full claim lifecycle", async function () {
      // 1. Create policy
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);

      // 2. Submit claim
      await insurance
        .connect(policyHolder)
        .submitClaim(1, 5000, 4500, 1, "QmHash", true);

      let claim = await insurance.claims(1);
      expect(claim.status).to.equal(0); // Submitted

      // 3. Authorize reviewer
      await insurance
        .connect(insuranceCompany)
        .authorizeReviewer(reviewer.address);

      // 4. Review claim
      await insurance
        .connect(reviewer)
        .reviewClaim(1, 4800, 4500, "Approved after review", 2);

      claim = await insurance.claims(1);
      expect(claim.status).to.equal(2); // Approved

      // 5. Process payment
      await insurance.connect(insuranceCompany).processPayment(1);

      claim = await insurance.claims(1);
      expect(claim.status).to.equal(4); // Paid
    });
  });
});
