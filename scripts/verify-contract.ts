import { ethers, run } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const insuranceAddress = process.env.INSURANCE_CONTRACT_ADDRESS;
  const pauserSetAddress = process.env.PAUSER_SET_ADDRESS;

  if (!insuranceAddress || !pauserSetAddress) {
    console.error("❌ Please set INSURANCE_CONTRACT_ADDRESS and PAUSER_SET_ADDRESS in .env");
    process.exit(1);
  }

  console.log("🔍 Verifying contracts on Etherscan...");
  console.log(`Insurance Contract: ${insuranceAddress}`);
  console.log(`PauserSet Contract: ${pauserSetAddress}`);

  try {
    // Verify PrivateVehicleInsurance
    console.log("\n📝 Verifying PrivateVehicleInsurance...");
    await run("verify:verify", {
      address: insuranceAddress,
      constructorArguments: [pauserSetAddress],
    });
    console.log("✅ PrivateVehicleInsurance verified!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  PrivateVehicleInsurance already verified");
    } else {
      console.error("❌ Verification failed:", error);
    }
  }

  console.log("\n✨ Verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
