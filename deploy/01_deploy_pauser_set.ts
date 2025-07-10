import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  // Get pauser addresses from environment or use default accounts
  const pauserAddresses: string[] = [];

  // Try to get from environment variables
  const numPausers = parseInt(process.env.NUM_PAUSERS || "0");

  if (numPausers > 0) {
    for (let i = 0; i < numPausers; i++) {
      const pauserAddress = process.env[`PAUSER_ADDRESS_${i}`];
      if (pauserAddress) {
        pauserAddresses.push(pauserAddress);
      }
    }
  }

  // Fallback: use deployer if no pausers configured
  if (pauserAddresses.length === 0) {
    log("⚠️  No pausers configured in .env, using deployer as default pauser");
    pauserAddresses.push(deployer);
  }

  log("----------------------------------------------------");
  log("Deploying PauserSet with pausers:");
  pauserAddresses.forEach((addr, idx) => {
    log(`  ${idx}: ${addr}`);
  });

  const pauserSet = await deploy("PauserSet", {
    from: deployer,
    args: [pauserAddresses],
    log: true,
    waitConfirmations: 1,
  });

  log(`PauserSet deployed at: ${pauserSet.address}`);
  log("----------------------------------------------------");
};

export default func;
func.tags = ["PauserSet", "all"];
