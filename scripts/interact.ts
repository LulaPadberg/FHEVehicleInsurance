import { ethers } from "hardhat";

async function main() {
  const [deployer, user1, user2] = await ethers.getSigners();

  // Get deployed contract address from environment or deployments
  const insuranceAddress = process.env.INSURANCE_CONTRACT_ADDRESS;
  if (!insuranceAddress) {
    console.error("❌ Please set INSURANCE_CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  console.log("🔗 Connecting to PrivateVehicleInsurance at:", insuranceAddress);

  const insurance = await ethers.getContractAt(
    "PrivateVehicleInsurance",
    insuranceAddress
  );

  // Check contract status
  console.log("\n📊 Contract Status:");
  console.log("  Insurance Company:", await insurance.insuranceCompany());
  console.log("  PauserSet Contract:", await insurance.pauserSetContract());
  console.log("  Is Paused:", await insurance.isPaused());
  console.log("  Next Policy ID:", await insurance.nextPolicyId());
  console.log("  Next Claim ID:", await insurance.nextClaimId());

  // Example: Create a policy
  console.log("\n🚗 Creating test policy...");
  try {
    const tx = await insurance.connect(user1).createPolicy(
      30, // age
      10, // driving years
      25000, // vehicle value
      1200 // premium
    );

    const receipt = await tx.wait();
    console.log("✅ Policy created! Transaction:", receipt?.hash);

    // Get policy details
    const policies = await insurance.getPoliciesByHolder(user1.address);
    console.log("  Policies for user:", policies);
  } catch (error) {
    console.error("❌ Failed to create policy:", error);
  }

  // Example: Submit a claim
  console.log("\n📋 Submitting test claim...");
  try {
    const tx = await insurance.connect(user1).submitClaim(
      1, // policyId
      5000, // damage amount
      4500, // repair cost
      1, // severity: Moderate
      "QmTestDocumentHash123", // IPFS hash
      true // isConfidential
    );

    const receipt = await tx.wait();
    console.log("✅ Claim submitted! Transaction:", receipt?.hash);

    // Get claim details
    const claims = await insurance.getClaimsByHolder(user1.address);
    console.log("  Claims for user:", claims);
  } catch (error) {
    console.error("❌ Failed to submit claim:", error);
  }

  // Example: Authorize reviewer
  console.log("\n👤 Authorizing reviewer...");
  try {
    const tx = await insurance.connect(deployer).authorizeReviewer(user2.address);
    await tx.wait();
    console.log("✅ Reviewer authorized:", user2.address);
  } catch (error) {
    console.error("❌ Failed to authorize reviewer:", error);
  }

  console.log("\n✨ Interaction complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
