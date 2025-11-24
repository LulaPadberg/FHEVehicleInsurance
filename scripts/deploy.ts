import { ethers } from "hardhat";

async function main() {
    console.log("Starting deployment...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    // Deploy PrivateEscrowWithRefund
    console.log("Deploying PrivateEscrowWithRefund...");
    const EscrowFactory = await ethers.getContractFactory("PrivateEscrowWithRefund");
    const escrowContract = await EscrowFactory.deploy();
    await escrowContract.waitForDeployment();
    const escrowAddress = await escrowContract.getAddress();
    console.log("PrivateEscrowWithRefund deployed to:", escrowAddress);

    // Deploy PrivacyPreservingMarket
    console.log("\nDeploying PrivacyPreservingMarket...");
    const MarketFactory = await ethers.getContractFactory("PrivacyPreservingMarket");
    const marketContract = await MarketFactory.deploy();
    await marketContract.waitForDeployment();
    const marketAddress = await marketContract.getAddress();
    console.log("PrivacyPreservingMarket deployed to:", marketAddress);

    // Display deployment summary
    console.log("\n========== Deployment Summary ==========");
    console.log("Deployer:", deployer.address);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("\nContract Addresses:");
    console.log("PrivateEscrowWithRefund:", escrowAddress);
    console.log("PrivacyPreservingMarket:", marketAddress);

    // Display configuration values
    console.log("\n========== Escrow Configuration ==========");
    const minTimeout = await escrowContract.MIN_TIMEOUT();
    const maxTimeout = await escrowContract.MAX_TIMEOUT();
    const decryptionTimeout = await escrowContract.DECRYPTION_TIMEOUT();
    const platformFeePercent = await escrowContract.platformFeePercent();

    console.log("MIN_TIMEOUT:", minTimeout.toString(), "seconds (", minTimeout / 3600n, "hours)");
    console.log("MAX_TIMEOUT:", maxTimeout.toString(), "seconds (", maxTimeout / 86400n, "days)");
    console.log("DECRYPTION_TIMEOUT:", decryptionTimeout.toString(), "seconds (", decryptionTimeout / 3600n, "hours)");
    console.log("Platform Fee:", platformFeePercent.toString(), "%");

    console.log("\n========== Market Configuration ==========");
    const platformFee = await marketContract.platformFee();
    console.log("Platform Fee:", platformFee.toString(), "basis points (", Number(platformFee) / 100, "%)");

    // Save deployment addresses
    console.log("\n========== Environment Variables ==========");
    console.log("Add these to your .env file:");
    console.log(`VITE_ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);
    console.log(`VITE_MARKET_CONTRACT_ADDRESS=${marketAddress}`);

    console.log("\n========== Verification Commands ==========");
    console.log("Run these commands to verify contracts on block explorer:");
    console.log(`npx hardhat verify --network <network-name> ${escrowAddress}`);
    console.log(`npx hardhat verify --network <network-name> ${marketAddress}`);

    console.log("\n========== Next Steps ==========");
    console.log("1. Update .env with contract addresses");
    console.log("2. Verify contracts on block explorer");
    console.log("3. Test contract interactions");
    console.log("4. Configure frontend with new addresses");
    console.log("5. Begin integration testing");

    console.log("\nDeployment completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
