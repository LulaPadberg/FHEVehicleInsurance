import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy, get, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");

  // Get PauserSet deployment
  const pauserSet = await get("PauserSet");
  log(`Using PauserSet at: ${pauserSet.address}`);

  // Deploy PrivateVehicleInsurance
  const insurance = await deploy("PrivateVehicleInsurance", {
    from: deployer,
    args: [pauserSet.address],
    log: true,
    waitConfirmations: 1,
  });

  log(`PrivateVehicleInsurance deployed at: ${insurance.address}`);

  // Verify on Etherscan if configured
  if (
    process.env.VERIFY_CONTRACT === "true" &&
    process.env.ETHERSCAN_API_KEY &&
    hre.network.name === "sepolia"
  ) {
    log("Waiting for block confirmations before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30s

    try {
      await hre.run("verify:verify", {
        address: insurance.address,
        constructorArguments: [pauserSet.address],
      });
      log("✅ Contract verified on Etherscan");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        log("ℹ️  Contract already verified");
      } else {
        log(`❌ Verification failed: ${error.message}`);
      }
    }
  }

  // Log deployment summary
  log("----------------------------------------------------");
  log("📋 Deployment Summary:");
  log(`  PauserSet: ${pauserSet.address}`);
  log(`  PrivateVehicleInsurance: ${insurance.address}`);
  log(`  Network: ${hre.network.name}`);
  log(`  Deployer: ${deployer}`);
  log("----------------------------------------------------");

  // Save deployment info to README
  const deploymentInfo = `
## 🚀 Deployment Information

**Network**: ${hre.network.name}
**Deployed**: ${new Date().toISOString()}

### Contract Addresses

- **PauserSet**: \`${pauserSet.address}\`
- **PrivateVehicleInsurance**: \`${insurance.address}\`

### Configuration

- **Deployer**: \`${deployer}\`
- **Insurance Company**: \`${deployer}\` (can be updated via updateInsuranceCompany)
`;

  log("\n" + deploymentInfo);
};

export default func;
func.tags = ["Insurance", "all"];
func.dependencies = ["PauserSet"];
