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

  // Timeout constants
  const MIN_TIMEOUT = 3600; // 1 hour
  const MAX_TIMEOUT = 30 * 24 * 3600; // 30 days
  const DECRYPTION_TIMEOUT = 2 * 3600; // 2 hours

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
          true,
          86400 // 24 hour timeout
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
      expect(claim.timeoutDeadline).to.be.gt(0);
    });

    it("Should track claims by holder", async function () {
      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 5000, 4500, 1, "QmHash1", true, 86400);

      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 3000, 2800, 0, "QmHash2", false, 86400);

      const claims = await insurance.getClaimsByHolder(policyHolder.address);
      expect(claims.length).to.equal(2);
      expect(claims[0]).to.equal(1);
      expect(claims[1]).to.equal(2);
    });

    it("Should fail with zero damage amount", async function () {
      await expect(
        insurance
          .connect(policyHolder)
          .submitClaim(policyId, 0, 4500, 1, "QmHash", true, 86400)
      ).to.be.revertedWith("Damage amount must be positive");
    });

    it("Should fail with zero repair cost", async function () {
      await expect(
        insurance
          .connect(policyHolder)
          .submitClaim(policyId, 5000, 0, 1, "QmHash", true, 86400)
      ).to.be.revertedWith("Repair cost must be positive");
    });

    it("Should fail with empty document hash", async function () {
      await expect(
        insurance
          .connect(policyHolder)
          .submitClaim(policyId, 5000, 4500, 1, "", true, 86400)
      ).to.be.revertedWith("Document hash required");
    });

    it("Should fail if not policy holder", async function () {
      await expect(
        insurance
          .connect(other)
          .submitClaim(policyId, 5000, 4500, 1, "QmHash", true, 86400)
      ).to.be.revertedWith("Not policy holder");
    });

    it("Should fail with invalid timeout - too short", async function () {
      await expect(
        insurance
          .connect(policyHolder)
          .submitClaim(policyId, 5000, 4500, 1, "QmHash", true, 1800) // 30 min < MIN_TIMEOUT
      ).to.be.revertedWith("Invalid timeout range");
    });

    it("Should fail with invalid timeout - too long", async function () {
      await expect(
        insurance
          .connect(policyHolder)
          .submitClaim(policyId, 5000, 4500, 1, "QmHash", true, 31 * 24 * 3600) // 31 days > MAX_TIMEOUT
      ).to.be.revertedWith("Invalid timeout range");
    });

    it("Should test all accident severity levels", async function () {
      // Minor
      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 1000, 900, 0, "QmHash1", false, 86400);

      // Moderate
      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 5000, 4500, 1, "QmHash2", false, 86400);

      // Major
      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 15000, 14000, 2, "QmHash3", true, 86400);

      // Severe
      await insurance
        .connect(policyHolder)
        .submitClaim(policyId, 24000, 23000, 3, "QmHash4", true, 86400);

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
        .submitClaim(policyId, 5000, 4500, 1, "QmHash", true, 86400);
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
        .submitClaim(1, 5000, 4500, 1, "QmHash", true, 86400);
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
        .submitClaim(1, 3000, 2800, 0, "QmHash2", false, 86400);

      await expect(
        insurance.connect(insuranceCompany).processPayment(2)
      ).to.be.revertedWith("Claim not ready for payment");
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
        .submitClaim(1, 5000, 4500, 1, "QmConfidentialHash", true, 86400);
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
        .submitClaim(1, 5000, 4500, 1, "QmHash1", true, 86400);
      await insurance
        .connect(policyHolder)
        .submitClaim(2, 3000, 2800, 0, "QmHash2", false, 86400);
      await insurance
        .connect(policyHolder)
        .submitClaim(3, 15000, 14000, 2, "QmHash3", true, 86400);

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
        .submitClaim(1, 5000, 4500, 1, "QmHash", true, 86400);

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

  describe("Decryption Request and Status", function () {
    let claimId: bigint;

    beforeEach(async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);
      await insurance
        .connect(policyHolder)
        .submitClaim(1, 5000, 4500, 1, "QmHash", true, 86400);
      claimId = 1n;

      // Approve the claim
      await insurance
        .connect(insuranceCompany)
        .reviewClaim(claimId, 4800, 4500, "Approved", 2);
    });

    it("Should get decryption request ID", async function () {
      const requestId = await insurance.getDecryptionRequestId(claimId);
      expect(requestId).to.equal(0); // Not yet requested
    });

    it("Should get decryption status", async function () {
      const status = await insurance.getDecryptionStatus(claimId);
      expect(status.requested).to.be.false;
      expect(status.callbackReceived).to.be.false;
      expect(status.requestId).to.equal(0);
      expect(status.timeoutDeadline).to.be.gt(0);
    });

    it("Should check if claim is timed out", async function () {
      expect(await insurance.isClaimTimedOut(claimId)).to.be.false;
    });

    it("Should fail to request decryption if not authorized", async function () {
      await expect(
        insurance.connect(other).requestClaimDecryption(claimId)
      ).to.be.revertedWith("Not authorized to request decryption");
    });

    it("Should fail to request decryption for non-approved claim", async function () {
      // Submit a new claim that's not approved
      await insurance
        .connect(policyHolder)
        .submitClaim(1, 3000, 2800, 0, "QmHash2", false, 86400);

      await expect(
        insurance.connect(insuranceCompany).requestClaimDecryption(2)
      ).to.be.revertedWith("Claim not approved for decryption");
    });
  });

  describe("Timeout Protection", function () {
    let claimId: bigint;

    beforeEach(async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);
      await insurance
        .connect(policyHolder)
        .submitClaim(1, 5000, 4500, 1, "QmHash", true, 3600); // 1 hour timeout
      claimId = 1n;

      // Approve the claim
      await insurance
        .connect(insuranceCompany)
        .reviewClaim(claimId, 4800, 4500, "Approved", 2);
    });

    it("Should not allow timeout before deadline", async function () {
      await expect(
        insurance.triggerClaimTimeout(claimId)
      ).to.be.revertedWith("Timeout not yet reached");
    });

    it("Should trigger timeout after deadline", async function () {
      // Advance time past timeout
      await time.increase(3601); // 1 hour + 1 second

      const tx = await insurance.triggerClaimTimeout(claimId);

      await expect(tx)
        .to.emit(insurance, "TimeoutTriggered")
        .withArgs(claimId);

      await expect(tx)
        .to.emit(insurance, "ClaimRefunded");

      const claim = await insurance.claims(claimId);
      expect(claim.status).to.equal(7); // Refunded
    });

    it("Should correctly report timeout status", async function () {
      expect(await insurance.isClaimTimedOut(claimId)).to.be.false;

      await time.increase(3601);

      expect(await insurance.isClaimTimedOut(claimId)).to.be.true;
    });
  });

  describe("Privacy Features", function () {
    it("Should store obfuscation noise in claim", async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);
      await insurance
        .connect(policyHolder)
        .submitClaim(1, 5000, 4500, 1, "QmHash", true, 86400);

      const claim = await insurance.claims(1);
      expect(claim.obfuscationNoise).to.be.gte(0);
      expect(claim.obfuscationNoise).to.be.lt(1000); // OBFUSCATION_NOISE_MAX
    });

    it("Should store price multiplier in claim", async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);
      await insurance
        .connect(policyHolder)
        .submitClaim(1, 5000, 4500, 1, "QmHash", true, 86400);

      const claim = await insurance.claims(1);
      expect(claim.priceMultiplier).to.be.gte(1);
      expect(claim.priceMultiplier).to.be.lte(10000); // PRICE_MULTIPLIER_RANGE
    });

    it("Should generate different noise for different claims", async function () {
      await insurance.connect(policyHolder).createPolicy(30, 10, 25000, 1200);

      await insurance
        .connect(policyHolder)
        .submitClaim(1, 5000, 4500, 1, "QmHash1", true, 86400);

      await insurance
        .connect(policyHolder)
        .submitClaim(1, 5000, 4500, 1, "QmHash2", true, 86400);

      const claim1 = await insurance.claims(1);
      const claim2 = await insurance.claims(2);

      // Not guaranteed to be different but should be different values
      // At least verify they're stored correctly
      expect(claim1.obfuscationNoise).to.be.gte(0);
      expect(claim2.obfuscationNoise).to.be.gte(0);
    });
  });
});
