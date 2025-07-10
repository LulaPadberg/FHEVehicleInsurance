/**
 * =====================================================
 * Complete Insurance Workflow Simulation Script
 * =====================================================
 *
 * This script simulates a complete insurance workflow:
 * 1. Multiple users create policies
 * 2. Users submit various claims
 * 3. Reviewers assess and approve/reject claims
 * 4. Insurance company processes payments
 * 5. Risk score calculations
 *
 * Usage:
 *   node scripts/simulate.js
 *   node scripts/simulate.js --network sepolia
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Helper function to pause execution
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("\n🎭 Starting Complete Insurance Workflow Simulation...\n");

  const network = hre.network.name;
  console.log(`📡 Network: ${network}`);

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("   Please deploy contracts first using: npx hardhat run scripts/deploy.js");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log(`📄 Loaded deployment data\n`);

  // Get signers (simulate different actors)
  const [deployer, alice, bob, carol, reviewer1, reviewer2] = await hre.ethers.getSigners();

  console.log("👥 Simulation Participants:");
  console.log(`   Insurance Company: ${deployer.address}`);
  console.log(`   Alice (Driver 1): ${alice.address}`);
  console.log(`   Bob (Driver 2): ${bob.address}`);
  console.log(`   Carol (Driver 3): ${carol.address}`);
  console.log(`   Reviewer 1: ${reviewer1.address}`);
  console.log(`   Reviewer 2: ${reviewer2.address}`);
  console.log("");

  // Get contract instance
  const insuranceAddress = deploymentData.contracts.PrivateVehicleInsurance.address;
  const PrivateVehicleInsurance = await hre.ethers.getContractFactory("PrivateVehicleInsurance");
  const insurance = PrivateVehicleInsurance.attach(insuranceAddress);

  console.log("=" .repeat(70));
  console.log("PHASE 1: SETUP & AUTHORIZATION");
  console.log("=" .repeat(70));
  console.log("");

  // =====================================================
  // Authorize Reviewers
  // =====================================================
  console.log("📝 Authorizing Reviewers...\n");

  try {
    const tx1 = await insurance.connect(deployer).authorizeReviewer(reviewer1.address);
    await tx1.wait();
    console.log(`✅ Reviewer 1 authorized: ${reviewer1.address}`);
  } catch (error) {
    if (error.message.includes("already authorized")) {
      console.log(`⚠️  Reviewer 1 already authorized`);
    }
  }

  try {
    const tx2 = await insurance.connect(deployer).authorizeReviewer(reviewer2.address);
    await tx2.wait();
    console.log(`✅ Reviewer 2 authorized: ${reviewer2.address}`);
  } catch (error) {
    if (error.message.includes("already authorized")) {
      console.log(`⚠️  Reviewer 2 already authorized`);
    }
  }

  console.log("");

  console.log("=" .repeat(70));
  console.log("PHASE 2: POLICY CREATION");
  console.log("=" .repeat(70));
  console.log("");

  // =====================================================
  // Create Policies for Different Users
  // =====================================================

  const policies = [
    {
      user: alice,
      name: "Alice",
      age: 28,
      drivingYears: 10,
      vehicleValue: 35000,
      premium: 800,
      description: "Young driver, moderate experience"
    },
    {
      user: bob,
      name: "Bob",
      age: 45,
      drivingYears: 25,
      vehicleValue: 60000,
      premium: 1500,
      description: "Experienced driver, high-value vehicle"
    },
    {
      user: carol,
      name: "Carol",
      age: 35,
      drivingYears: 15,
      vehicleValue: 40000,
      premium: 1000,
      description: "Mid-age driver, average vehicle"
    }
  ];

  const createdPolicies = [];

  for (const policy of policies) {
    console.log(`📋 Creating policy for ${policy.name}...`);
    console.log(`   Age: ${policy.age}, Experience: ${policy.drivingYears} years`);
    console.log(`   Vehicle Value: $${policy.vehicleValue}, Premium: $${policy.premium}`);
    console.log(`   Profile: ${policy.description}`);

    try {
      const tx = await insurance.connect(policy.user).createPolicy(
        policy.age,
        policy.drivingYears,
        policy.vehicleValue,
        policy.premium
      );
      const receipt = await tx.wait();

      const policyCreatedEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === "PolicyCreated"
      );

      if (policyCreatedEvent) {
        const policyId = policyCreatedEvent.args[0];
        createdPolicies.push({ ...policy, policyId });
        console.log(`✅ Policy created! Policy ID: ${policyId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create policy for ${policy.name}:`, error.message);
    }

    console.log("");
  }

  console.log(`📊 Total policies created: ${createdPolicies.length}\n`);

  console.log("=" .repeat(70));
  console.log("PHASE 3: CLAIM SUBMISSION");
  console.log("=" .repeat(70));
  console.log("");

  // =====================================================
  // Submit Various Claims
  // =====================================================

  const claims = [
    {
      policy: createdPolicies[0], // Alice
      damageAmount: 3000,
      repairCost: 2800,
      severity: 0, // Minor
      documentHash: "QmAliceMinorAccident2024",
      isConfidential: true,
      description: "Minor fender bender"
    },
    {
      policy: createdPolicies[1], // Bob
      damageAmount: 15000,
      repairCost: 14000,
      severity: 2, // Major
      documentHash: "QmBobMajorCollision2024",
      isConfidential: true,
      description: "Major collision with another vehicle"
    },
    {
      policy: createdPolicies[2], // Carol
      damageAmount: 6000,
      repairCost: 5500,
      severity: 1, // Moderate
      documentHash: "QmCarolModerateAccident2024",
      isConfidential: false,
      description: "Moderate damage from parking incident"
    }
  ];

  const submittedClaims = [];

  for (const claim of claims) {
    if (!claim.policy || !claim.policy.policyId) {
      console.log(`⚠️  Skipping claim - no policy found\n`);
      continue;
    }

    console.log(`📝 ${claim.policy.name} submitting claim...`);
    console.log(`   Policy ID: ${claim.policy.policyId}`);
    console.log(`   Damage: $${claim.damageAmount}, Repair Cost: $${claim.repairCost}`);
    console.log(`   Severity: ${["Minor", "Moderate", "Major", "Severe"][claim.severity]}`);
    console.log(`   Description: ${claim.description}`);
    console.log(`   Confidential: ${claim.isConfidential}`);

    try {
      const tx = await insurance.connect(claim.policy.user).submitClaim(
        claim.policy.policyId,
        claim.damageAmount,
        claim.repairCost,
        claim.severity,
        claim.documentHash,
        claim.isConfidential
      );
      const receipt = await tx.wait();

      const claimSubmittedEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === "ClaimSubmitted"
      );

      if (claimSubmittedEvent) {
        const claimId = claimSubmittedEvent.args[0];
        submittedClaims.push({ ...claim, claimId });
        console.log(`✅ Claim submitted! Claim ID: ${claimId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to submit claim:`, error.message);
    }

    console.log("");
  }

  console.log(`📊 Total claims submitted: ${submittedClaims.length}\n`);

  console.log("=" .repeat(70));
  console.log("PHASE 4: CLAIM REVIEW & PROCESSING");
  console.log("=" .repeat(70));
  console.log("");

  // =====================================================
  // Review and Process Claims
  // =====================================================

  const reviewDecisions = [
    {
      claim: submittedClaims[0], // Alice's minor claim
      reviewer: reviewer1,
      assessedDamage: 3000,
      recommendedPayout: 2800,
      status: 2, // Approved
      reviewNotes: "Minor damage verified, claim approved"
    },
    {
      claim: submittedClaims[1], // Bob's major claim
      reviewer: reviewer2,
      assessedDamage: 15000,
      recommendedPayout: 13500,
      status: 2, // Approved
      reviewNotes: "Major damage documented, approved with adjusted payout"
    },
    {
      claim: submittedClaims[2], // Carol's moderate claim
      reviewer: reviewer1,
      assessedDamage: 6000,
      recommendedPayout: 5500,
      status: 2, // Approved
      reviewNotes: "Moderate damage confirmed, claim approved"
    }
  ];

  for (const review of reviewDecisions) {
    if (!review.claim || !review.claim.claimId) {
      console.log(`⚠️  Skipping review - no claim found\n`);
      continue;
    }

    console.log(`🔍 Reviewing Claim ID: ${review.claim.claimId}`);
    console.log(`   Reviewer: ${review.reviewer.address}`);
    console.log(`   Assessed Damage: $${review.assessedDamage}`);
    console.log(`   Recommended Payout: $${review.recommendedPayout}`);
    console.log(`   Decision: ${["Submitted", "UnderReview", "Approved", "Rejected", "Paid"][review.status]}`);
    console.log(`   Notes: ${review.reviewNotes}`);

    try {
      const tx = await insurance.connect(review.reviewer).reviewClaim(
        review.claim.claimId,
        review.assessedDamage,
        review.recommendedPayout,
        review.reviewNotes,
        review.status
      );
      const receipt = await tx.wait();
      console.log(`✅ Claim reviewed! Transaction: ${receipt.hash}`);
    } catch (error) {
      console.error(`❌ Failed to review claim:`, error.message);
    }

    console.log("");
  }

  console.log("=" .repeat(70));
  console.log("PHASE 5: PAYMENT PROCESSING");
  console.log("=" .repeat(70));
  console.log("");

  // =====================================================
  // Process Payments for Approved Claims
  // =====================================================

  for (const claim of submittedClaims) {
    if (!claim.claimId) continue;

    try {
      const claimStatus = await insurance.getClaimStatus(claim.claimId);

      if (claimStatus === 2) { // Approved
        console.log(`💰 Processing payment for Claim ID: ${claim.claimId}`);
        console.log(`   Claimant: ${claim.policy.name}`);

        const tx = await insurance.connect(deployer).processPayment(claim.claimId);
        const receipt = await tx.wait();
        console.log(`✅ Payment processed! Transaction: ${receipt.hash}`);
        console.log("");
      }
    } catch (error) {
      console.error(`❌ Failed to process payment for claim ${claim.claimId}:`, error.message);
      console.log("");
    }
  }

  console.log("=" .repeat(70));
  console.log("PHASE 6: RISK SCORE CALCULATION");
  console.log("=" .repeat(70));
  console.log("");

  // =====================================================
  // Calculate Risk Scores
  // =====================================================

  for (const policy of createdPolicies) {
    if (!policy.policyId) continue;

    console.log(`📊 Calculating risk score for ${policy.name}'s policy...`);
    console.log(`   Policy ID: ${policy.policyId}`);

    try {
      const tx = await insurance.calculateRiskScore(policy.policyId);
      // For view functions that return data, we don't wait for transaction
      console.log(`✅ Risk score calculated (encrypted)`);
    } catch (error) {
      console.error(`❌ Failed to calculate risk score:`, error.message);
    }

    console.log("");
  }

  console.log("=" .repeat(70));
  console.log("🎉 SIMULATION SUMMARY");
  console.log("=" .repeat(70));
  console.log("");

  // =====================================================
  // Display Final Summary
  // =====================================================

  console.log("📊 Statistics:");
  console.log(`   ✅ Policies Created: ${createdPolicies.length}`);
  console.log(`   ✅ Claims Submitted: ${submittedClaims.length}`);
  console.log(`   ✅ Claims Reviewed: ${reviewDecisions.length}`);
  console.log(`   ✅ Authorized Reviewers: 2`);
  console.log("");

  console.log("👥 User Summary:");
  for (const policy of createdPolicies) {
    const userClaims = await insurance.getClaimsByHolder(policy.user.address);
    console.log(`   ${policy.name}:`);
    console.log(`     - Policies: 1 (ID: ${policy.policyId})`);
    console.log(`     - Claims: ${userClaims.length}`);

    for (const claimId of userClaims) {
      try {
        const status = await insurance.getClaimStatus(claimId);
        const statusName = ["Submitted", "UnderReview", "Approved", "Rejected", "Paid"][status];
        console.log(`       * Claim ${claimId}: ${statusName}`);
      } catch (error) {
        console.log(`       * Claim ${claimId}: Unable to fetch status`);
      }
    }
  }

  console.log("");
  console.log("✅ Simulation completed successfully!");
  console.log("");

  console.log("🔗 Contract State:");
  const nextPolicyId = await insurance.nextPolicyId();
  const nextClaimId = await insurance.nextClaimId();
  console.log(`   Next Policy ID: ${nextPolicyId}`);
  console.log(`   Next Claim ID: ${nextClaimId}`);
  console.log(`   Contract Paused: ${await insurance.isPaused()}`);
  console.log("");

  console.log("📝 Key Features Demonstrated:");
  console.log("   ✅ Policy creation with encrypted data (FHE)");
  console.log("   ✅ Claim submission with various severity levels");
  console.log("   ✅ Multi-reviewer authorization system");
  console.log("   ✅ Claim review and approval process");
  console.log("   ✅ Payment processing workflow");
  console.log("   ✅ Risk score calculation on encrypted data");
  console.log("   ✅ Privacy-preserving insurance operations");
  console.log("");

  console.log("=" .repeat(70));
  console.log("");
}

// Execute simulation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });
