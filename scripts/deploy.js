/**
 * Deploy Script for Private Vehicle Insurance
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network sepolia
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment process...\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("📋 Deployment Configuration:");
  console.log("  Network:", network);
  console.log("  Deployer:", deployer.address);
  console.log("  Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // Deploy PauserSet
  console.log("📦 Deploying PauserSet...");

  // Get pauser addresses from environment
  const numPausers = parseInt(process.env.NUM_PAUSERS || "2");
  const pauserAddresses = [];

  for (let i = 0; i < numPausers; i++) {
    const pauserAddress = process.env[`PAUSER_ADDRESS_${i}`];
    if (!pauserAddress || pauserAddress === "0x0000000000000000000000000000000000000000") {
      console.log(`⚠️  Warning: PAUSER_ADDRESS_${i} not set, using deployer address`);
      pauserAddresses.push(deployer.address);
    } else {
      pauserAddresses.push(pauserAddress);
    }
  }

  console.log(`   Pauser Addresses (${pauserAddresses.length}):`);
  pauserAddresses.forEach((addr, idx) => {
    console.log(`   ${idx}: ${addr}`);
  });

  const PauserSet = await hre.ethers.getContractFactory("PauserSet");
  const pauserSet = await PauserSet.deploy(pauserAddresses);
  await pauserSet.waitForDeployment();
  const pauserSetAddress = await pauserSet.getAddress();
  console.log("✅ PauserSet deployed to:", pauserSetAddress);
  console.log("");

  // Deploy PrivateVehicleInsurance
  console.log("📦 Deploying PrivateVehicleInsurance...");
  const PrivateVehicleInsurance = await hre.ethers.getContractFactory("PrivateVehicleInsurance");
  const insurance = await PrivateVehicleInsurance.deploy(pauserSetAddress);
  await insurance.waitForDeployment();
  const insuranceAddress = await insurance.getAddress();
  console.log("✅ PrivateVehicleInsurance deployed to:", insuranceAddress);
  console.log("");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const insuranceCompany = await insurance.insuranceCompany();
  const pauserSetContract = await insurance.pauserSetContract();
  console.log("  Insurance Company:", insuranceCompany);
  console.log("  PauserSet Contract:", pauserSetContract);
  console.log("  Is Paused:", await insurance.isPaused());
  console.log("");

  // Save deployment information
  const deploymentData = {
    network: network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      PauserSet: {
        address: pauserSetAddress,
        constructorArgs: [pauserAddresses]
      },
      PrivateVehicleInsurance: {
        address: insuranceAddress,
        constructorArgs: [pauserSetAddress]
      }
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save to JSON file
  const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);
  console.log("");

  // Display summary
  console.log("=" .repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=" .repeat(60));
  console.log("");
  console.log("Network:", network);
  console.log("Chain ID:", deploymentData.chainId);
  console.log("");
  console.log("Contract Addresses:");
  console.log("  PauserSet:", pauserSetAddress);
  console.log("  PrivateVehicleInsurance:", insuranceAddress);
  console.log("");

  if (network === "sepolia") {
    console.log("🔗 Etherscan Links:");
    console.log(`  PauserSet: https://sepolia.etherscan.io/address/${pauserSetAddress}`);
    console.log(`  PrivateVehicleInsurance: https://sepolia.etherscan.io/address/${insuranceAddress}`);
    console.log("");
    console.log("⚠️  Don't forget to verify contracts using:");
    console.log(`  npx hardhat run scripts/verify.js --network sepolia`);
    console.log("");
  }

  console.log("✅ Deployment completed successfully!");
  console.log("=" .repeat(60));
  console.log("");

  // Save addresses to .env format for easy reference
  const envContent = `
# Deployment Addresses (${network})
PAUSERSET_ADDRESS=${pauserSetAddress}
INSURANCE_CONTRACT_ADDRESS=${insuranceAddress}
`;

  const envFile = path.join(deploymentsDir, `${network}.env`);
  fs.writeFileSync(envFile, envContent.trim());
  console.log("📝 Environment variables saved to:", envFile);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
