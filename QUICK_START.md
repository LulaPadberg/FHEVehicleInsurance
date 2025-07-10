# 🚀 Quick Start Guide - Private Vehicle Insurance Platform

## ⚡ 5-Minute Setup

This guide will get you up and running with the Private Vehicle Insurance Platform in 5 minutes.

## 📋 Prerequisites

- Node.js v18+ installed
- MetaMask wallet configured
- Sepolia ETH for testing (get from [Sepolia Faucet](https://sepoliafaucet.com/))

## 🔧 Setup Steps

### 1. Clone and Install

```bash
cd D:\
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
# Network Configuration
NETWORK=sepolia
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Etherscan Verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# FHE Configuration
NUM_PAUSERS=2
PAUSER_ADDRESS_0=0x0000000000000000000000000000000000000000
PAUSER_ADDRESS_1=0x0000000000000000000000000000000000000001
KMS_GENERATION_ADDRESS=0x0000000000000000000000000000000000000000

# Frontend
VITE_CONTRACT_ADDRESS=0x07e59aEcC74578c859a89a4CD7cD40E760625890
VITE_PAUSERSET_ADDRESS=0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D
VITE_NETWORK=sepolia
VITE_GATEWAY_URL=https://gateway.sepolia.zama.ai
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 2 Solidity files successfully
```

### 4. Run Tests (Optional)

```bash
npx hardhat test
```

## 🚀 Deployment

### Deploy to Local Network

```bash
# Terminal 1 - Start local node
npx hardhat node

# Terminal 2 - Deploy
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected Output:**
```
🚀 Starting Private Vehicle Insurance Platform Deployment...

📡 Network: sepolia
🔗 Chain ID: 11155111
👤 Deployer Address: 0x...
💰 Deployer Balance: 0.5 ETH

📝 Step 1: Deploying PauserSet Contract...
✅ PauserSet deployed to: 0x...

📝 Step 2: Deploying PrivateVehicleInsurance Contract...
✅ PrivateVehicleInsurance deployed to: 0x...

🎉 DEPLOYMENT SUMMARY
...
```

## ✅ Verify Deployment

```bash
node scripts/verify.js --network sepolia
```

## 🔗 Interact with Contracts

### Test Basic Interactions

```bash
node scripts/interact.js --network sepolia
```

This will demonstrate:
- ✅ Creating a policy
- ✅ Querying user policies
- ✅ Authorizing reviewers
- ✅ Submitting claims
- ✅ Querying claim details

### Run Complete Simulation

```bash
node scripts/simulate.js --network sepolia
```

This simulates a complete insurance workflow:
- ✅ 3 users create policies
- ✅ 3 claims submitted (Minor, Moderate, Major)
- ✅ Reviewer assessments
- ✅ Payment processing
- ✅ Risk score calculations

## 📊 Check Deployment Info

After deployment, check the `deployments/` directory:

```bash
cat deployments/sepolia-deployment.json
```

Output:
```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "deployer": "0x...",
  "deploymentTime": "2025-10-23T...",
  "contracts": {
    "PauserSet": {
      "address": "0x...",
      "pauserAddresses": ["0x...", "0x..."]
    },
    "PrivateVehicleInsurance": {
      "address": "0x...",
      "insuranceCompany": "0x...",
      "pauserSetContract": "0x..."
    }
  }
}
```

## 🌐 Frontend Integration

### Update Frontend Config

Update your frontend configuration with deployed contract addresses:

```javascript
// src/config/contracts.js
export const CONTRACTS = {
  INSURANCE_ADDRESS: '0x07e59aEcC74578c859a89a4CD7cD40E760625890',
  PAUSERSET_ADDRESS: '0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D',
  NETWORK: 'sepolia',
  CHAIN_ID: 11155111
};
```

### Start Frontend

```bash
npm run dev
```

Access at: `http://localhost:5173`

## 🧪 Testing Workflow

### 1. Create a Policy

```javascript
// Age: 30, Driving Years: 10, Vehicle Value: $35,000, Premium: $1,000
await insurance.createPolicy(30, 10, 35000, 1000);
```

### 2. Submit a Claim

```javascript
await insurance.submitClaim(
  policyId,
  5000,  // damage amount
  4500,  // repair cost
  1,     // severity (Moderate)
  "QmIPFSHash",
  true   // confidential
);
```

### 3. Review Claim (as reviewer)

```javascript
await insurance.reviewClaim(
  claimId,
  5000,  // assessed damage
  4500,  // recommended payout
  "Claim approved",
  2      // status: Approved
);
```

### 4. Process Payment (as insurance company)

```javascript
await insurance.processPayment(claimId);
```

## 🔍 Verify on Etherscan

Visit your deployed contracts on Etherscan:
```
PrivateVehicleInsurance: https://sepolia.etherscan.io/address/0x07e59aEcC74578c859a89a4CD7cD40E760625890
PauserSet: https://sepolia.etherscan.io/address/0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D
```

## 🎯 Success Checklist

- [ ] Contracts compiled successfully
- [ ] Deployed to Sepolia testnet
- [ ] Contracts verified on Etherscan
- [ ] Interaction script executed without errors
- [ ] Simulation completed successfully
- [ ] Frontend connected to contracts
- [ ] Can create policies
- [ ] Can submit claims

## 🆘 Troubleshooting

### Issue: "Insufficient funds"
**Solution:** Get Sepolia ETH from [faucet](https://sepoliafaucet.com/)

### Issue: "Network connection failed"
**Solution:** Check RPC_URL in `.env` file

### Issue: "Contract verification failed"
**Solution:** Ensure ETHERSCAN_API_KEY is set correctly

### Issue: "Transaction reverted"
**Solution:** Check Hardhat console for detailed error message

## 📚 Next Steps

1. **Read Full Documentation**
   - [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
   - [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) - Technical details

2. **Explore Features**
   - Create multiple policies
   - Test different claim scenarios
   - Experiment with reviewer system
   - Test pause/unpause functionality

3. **Customize**
   - Modify contract parameters
   - Add custom claim types
   - Implement additional features

4. **Deploy to Production**
   - Audit contracts
   - Configure mainnet settings
   - Deploy to Ethereum mainnet

## 🔗 Useful Links

- **Live Demo**: [https://private-vehicle-insurance.vercel.app/](https://private-vehicle-insurance.vercel.app/)
- **GitHub**: [PrivateVehicleInsurance](https://github.com/LulaPadberg/PrivateVehicleInsurance)
- **Contracts**:
  - PrivateVehicleInsurance: [0x07e59aEcC74578c859a89a4CD7cD40E760625890](https://sepolia.etherscan.io/address/0x07e59aEcC74578c859a89a4CD7cD40E760625890)
  - PauserSet: [0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D](https://sepolia.etherscan.io/address/0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D)
- **Zama Docs**: [https://docs.zama.ai](https://docs.zama.ai)

## 💡 Tips

1. **Save Gas**: Test on local network first
2. **Use Testnet**: Always test on Sepolia before mainnet
3. **Backup Keys**: Keep your private keys secure
4. **Monitor Transactions**: Watch transactions on Etherscan
5. **Check Logs**: Review deployment logs in `deployments/` directory

---

**Ready to build privacy-preserving insurance applications? Let's go! 🚀**
