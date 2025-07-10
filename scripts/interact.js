/**
 * =====================================================
 * Contract Interaction Script
 * =====================================================
 *
 * This script demonstrates interaction with deployed contracts
 *
 * Usage:
 *   node scripts/interact.js
 *   node scripts/interact.js --network sepolia
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🔗 Starting Contract Interaction...\n");

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

  // Get signers
  const [deployer, user1, user2] = await hre.ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`👤 User1: ${user1.address}`);
  console.log(`👤 User2: ${user2.address}\n`);

  // Get contract instances
  const pauserSetAddress = deploymentData.contracts.PauserSet.address;
  const insuranceAddress = deploymentData.contracts.PrivateVehicleInsurance.address;

  const PauserSet = await hre.ethers.getContractFactory("PauserSet");
  const pauserSet = PauserSet.attach(pauserSetAddress);

  const PrivateVehicleInsurance = await hre.ethers.getContractFactory("PrivateVehicleInsurance");
  const insurance = PrivateVehicleInsurance.attach(insuranceAddress);

  console.log("=" .repeat(60));
  console.log("📋 CONTRACT INFORMATION");
  console.log("=" .repeat(60));
  console.log("");

  // =====================================================
  // Query Contract State
  // =====================================================
  console.log("🔍 Querying Contract State...\n");

  const insuranceCompany = await insurance.insuranceCompany();
  const pauserSetContract = await insurance.pauserSetContract();
  const isPaused = await insurance.isPaused();
  const nextPolicyId = await insurance.nextPolicyId();
  const nextClaimId = await insurance.nextClaimId();

  console.log(`Insurance Company: ${insuranceCompany}`);
  console.log(`PauserSet Contract: ${pauserSetContract}`);
  console.log(`Is Paused: ${isPaused}`);
  console.log(`Next Policy ID: ${nextPolicyId}`);
  console.log(`Next Claim ID: ${nextClaimId}`);
  console.log("");

  // =====================================================
  // Example 1: Create a Policy
  // =====================================================
  console.log("=" .repeat(60));
  console.log("📝 Example 1: Creating a Policy");
  console.log("=" .repeat(60));
  console.log("");

  const policyData = {
    age: 35,
    drivingYears: 15,
    vehicleValue: 50000,
    premium: 1200
  };

  console.log("Policy Data:");
  console.log(`  Age: ${policyData.age}`);
  console.log(`  Driving Years: ${policyData.drivingYears}`);
  console.log(`  Vehicle Value: $${policyData.vehicleValue}`);
  console.log(`  Premium: $${policyData.premium}`);
  console.log("");

  try {
    console.log("📤 Creating policy...");
    const tx1 = await insurance.connect(user1).createPolicy(
      policyData.age,
      policyData.drivingYears,
      policyData.vehicleValue,
      policyData.premium
    );
    const receipt1 = await tx1.wait();
    console.log(`✅ Policy created! Transaction: ${receipt1.hash}`);

    // Get policy ID from event
    const policyCreatedEvent = receipt1.logs.find(
      log => log.fragment && log.fragment.name === "PolicyCreated"
    );
    if (policyCreatedEvent) {
      console.log(`   Policy ID: ${policyCreatedEvent.args[0]}`);
    }
    console.log("");
  } catch (error) {
    console.error(`❌ Failed to create policy:`, error.message);
    console.log("");
  }

  // =====================================================
  // Example 2: Query User Policies
  // =====================================================
  console.log("=" .repeat(60));
  console.log("📝 Example 2: Querying User Policies");
  console.log("=" .repeat(60));
  console.log("");

  try {
    const userPolicies = await insurance.getPoliciesByHolder(user1.address);
    console.log(`User1 has ${userPolicies.length} policy/policies:`);
    userPolicies.forEach((policyId, index) => {
      console.log(`  ${index + 1}. Policy ID: ${policyId}`);
    });
    console.log("");
  } catch (error) {
    console.error(`❌ Failed to query policies:`, error.message);
    console.log("");
  }

  // =====================================================
  // Example 3: Authorize Reviewer
  // =====================================================
  console.log("=" .repeat(60));
  console.log("📝 Example 3: Authorizing Reviewer");
  console.log("=" .repeat(60));
  console.log("");

  try {
    console.log(`📤 Authorizing ${user2.address} as reviewer...`);
    const tx2 = await insurance.connect(deployer).authorizeReviewer(user2.address);
    const receipt2 = await tx2.wait();
    console.log(`✅ Reviewer authorized! Transaction: ${receipt2.hash}`);

    // Check authorization
    const isAuthorized = await insurance.authorizedReviewers(user2.address);
    console.log(`   Is Authorized: ${isAuthorized}`);
    console.log("");
  } catch (error) {
    if (error.message.includes("Reviewer already authorized")) {
      console.log(`⚠️  Reviewer already authorized`);
      console.log("");
    } else {
      console.error(`❌ Failed to authorize reviewer:`, error.message);
      console.log("");
    }
  }

  // =====================================================
  // Example 4: Submit a Claim
  // =====================================================
  console.log("=" .repeat(60));
  console.log("📝 Example 4: Submitting a Claim");
  console.log("=" .repeat(60));
  console.log("");

  // First, ensure user1 has a policy
  const userPolicies = await insurance.getPoliciesByHolder(user1.address);

  if (userPolicies.length > 0) {
    const claimData = {
      policyId: userPolicies[0],
      damageAmount: 5000,
      repairCost: 4500,
      severity: 1, // Moderate
      documentHash: "QmTest123456789DocumentHash",
      isConfidential: true
    };

    console.log("Claim Data:");
    console.log(`  Policy ID: ${claimData.policyId}`);
    console.log(`  Damage Amount: $${claimData.damageAmount}`);
    console.log(`  Repair Cost: $${claimData.repairCost}`);
    console.log(`  Severity: ${["Minor", "Moderate", "Major", "Severe"][claimData.severity]}`);
    console.log(`  Document Hash: ${claimData.documentHash}`);
    console.log(`  Is Confidential: ${claimData.isConfidential}`);
    console.log("");

    try {
      console.log("📤 Submitting claim...");
      const tx3 = await insurance.connect(user1).submitClaim(
        claimData.policyId,
        claimData.damageAmount,
        claimData.repairCost,
        claimData.severity,
        claimData.documentHash,
        claimData.isConfidential
      );
      const receipt3 = await tx3.wait();
      console.log(`✅ Claim submitted! Transaction: ${receipt3.hash}`);

      // Get claim ID from event
      const claimSubmittedEvent = receipt3.logs.find(
        log => log.fragment && log.fragment.name === "ClaimSubmitted"
      );
      if (claimSubmittedEvent) {
        console.log(`   Claim ID: ${claimSubmittedEvent.args[0]}`);
      }
      console.log("");
    } catch (error) {
      console.error(`❌ Failed to submit claim:`, error.message);
      console.log("");
    }
  } else {
    console.log("⚠️  No policy found for user1. Skipping claim submission.");
    console.log("");
  }

  // =====================================================
  // Example 5: Query User Claims
  // =====================================================
  console.log("=" .repeat(60));
  console.log("📝 Example 5: Querying User Claims");
  console.log("=" .repeat(60));
  console.log("");

  try {
    const userClaims = await insurance.getClaimsByHolder(user1.address);
    console.log(`User1 has ${userClaims.length} claim(s):`);

    for (let i = 0; i < userClaims.length; i++) {
      const claimId = userClaims[i];
      try {
        const claimDetails = await insurance.connect(user1).getClaimDetails(claimId);
        console.log(`\n  Claim ${i + 1} (ID: ${claimId}):`);
        console.log(`    Claimant: ${claimDetails[1]}`);
        console.log(`    Status: ${["Submitted", "UnderReview", "Approved", "Rejected", "Paid"][claimDetails[2]]}`);
        console.log(`    Severity: ${["Minor", "Moderate", "Major", "Severe"][claimDetails[3]]}`);
        console.log(`    Document Hash: ${claimDetails[4]}`);
        console.log(`    Confidential: ${claimDetails[7]}`);
      } catch (error) {
        console.log(`    Unable to fetch details for claim ${claimId}`);
      }
    }
    console.log("");
  } catch (error) {
    console.error(`❌ Failed to query claims:`, error.message);
    console.log("");
  }

  // =====================================================
  // Display Summary
  // =====================================================
  console.log("=" .repeat(60));
  console.log("🎉 INTERACTION SUMMARY");
  console.log("=" .repeat(60));
  console.log("");
  console.log("✅ Successfully demonstrated:");
  console.log("   1. Creating a policy with encrypted data");
  console.log("   2. Querying user policies");
  console.log("   3. Authorizing reviewers");
  console.log("   4. Submitting insurance claims");
  console.log("   5. Querying user claims and details");
  console.log("");
  console.log("📝 Next Steps:");
  console.log("   - Run simulation script: node scripts/simulate.js");
  console.log("   - Test claim review process");
  console.log("   - Test payment processing");
  console.log("");
  console.log("=" .repeat(60));
  console.log("");
}

// Execute interaction
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });
