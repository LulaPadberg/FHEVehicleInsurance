/**
 * =====================================================
 * Contract Verification Script
 * =====================================================
 *
 * This script verifies deployed contracts on Etherscan
 *
 * Usage:
 *   node scripts/verify.js
 *   node scripts/verify.js --network sepolia
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🔍 Starting Contract Verification Process...\n");

  const network = hre.network.name;
  console.log(`📡 Network: ${network}`);

  // Check if Etherscan API key is set
  if (!process.env.ETHERSCAN_API_KEY) {
    console.error("❌ ETHERSCAN_API_KEY not found in .env file");
    console.log("   Please set ETHERSCAN_API_KEY in your .env file");
    process.exit(1);
  }

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("   Please deploy contracts first using: npx hardhat run scripts/deploy.js");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log(`📄 Loaded deployment data from: ${deploymentFile}\n`);

  // =====================================================
  // Verify PauserSet Contract
  // =====================================================
  console.log("=" .repeat(60));
  console.log("📝 Step 1: Verifying PauserSet Contract");
  console.log("=" .repeat(60));

  const pauserSetAddress = deploymentData.contracts.PauserSet.address;
  const pauserSetArgs = deploymentData.contracts.PauserSet.constructorArgs;

  console.log(`Address: ${pauserSetAddress}`);
  console.log(`Constructor Args:`, pauserSetArgs);

  try {
    await hre.run("verify:verify", {
      address: pauserSetAddress,
      constructorArguments: pauserSetArgs,
    });
    console.log(`✅ PauserSet verified successfully!`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`⚠️  PauserSet is already verified`);
    } else {
      console.error(`❌ PauserSet verification failed:`, error.message);
    }
  }

  console.log("");

  // =====================================================
  // Verify PrivateVehicleInsurance Contract
  // =====================================================
  console.log("=" .repeat(60));
  console.log("📝 Step 2: Verifying PrivateVehicleInsurance Contract");
  console.log("=" .repeat(60));

  const insuranceAddress = deploymentData.contracts.PrivateVehicleInsurance.address;
  const insuranceArgs = deploymentData.contracts.PrivateVehicleInsurance.constructorArgs;

  console.log(`Address: ${insuranceAddress}`);
  console.log(`Constructor Args:`, insuranceArgs);

  try {
    await hre.run("verify:verify", {
      address: insuranceAddress,
      constructorArguments: insuranceArgs,
    });
    console.log(`✅ PrivateVehicleInsurance verified successfully!`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`⚠️  PrivateVehicleInsurance is already verified`);
    } else {
      console.error(`❌ PrivateVehicleInsurance verification failed:`, error.message);
    }
  }

  console.log("");

  // =====================================================
  // Display Summary
  // =====================================================
  console.log("=" .repeat(60));
  console.log("🎉 VERIFICATION SUMMARY");
  console.log("=" .repeat(60));
  console.log("");
  console.log(`📡 Network: ${network}`);
  console.log("");
  console.log("🔗 Etherscan Links:");
  console.log(`   PauserSet:`);
  console.log(`   https://sepolia.etherscan.io/address/${pauserSetAddress}#code`);
  console.log("");
  console.log(`   PrivateVehicleInsurance:`);
  console.log(`   https://sepolia.etherscan.io/address/${insuranceAddress}#code`);
  console.log("");
  console.log("✅ Verification process completed!");
  console.log("=" .repeat(60));
  console.log("");

  // Save verification status
  deploymentData.verification = {
    verifiedAt: new Date().toISOString(),
    network: network,
    etherscanLinks: {
      PauserSet: `https://sepolia.etherscan.io/address/${pauserSetAddress}#code`,
      PrivateVehicleInsurance: `https://sepolia.etherscan.io/address/${insuranceAddress}#code`
    }
  };

  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  console.log("💾 Verification status saved to deployment file\n");
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification failed:");
    console.error(error);
    process.exit(1);
  });
