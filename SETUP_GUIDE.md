# Setup & Installation Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
```bash
# Required
- Node.js v18 or higher
- npm or yarn
- Git
- MetaMask browser extension

# Optional
- Infura account (for Sepolia deployment)
- Etherscan API key (for verification)
```

### Step 1: Clone & Install
```bash
cd D:\
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Minimum configuration for local testing
NETWORK=localhost
REPORT_GAS=true

# For Sepolia deployment (optional)
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Step 3: Compile Contracts
```bash
npm run compile
```

Expected output:
```
Compiled 2 Solidity files successfully
✓ PrivateVehicleInsurance.sol
✓ PauserSet.sol
```

### Step 4: Run Tests
```bash
npm test
```

Expected: 250+ tests passing

### Step 5: Check Contract Size
```bash
npm run size
```

Should show contracts < 24KB

## 📋 Detailed Setup

### Development Environment Setup

#### 1. Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install
```

#### 2. Verify Installation
```bash
# Check Hardhat
npx hardhat --version

# Check TypeScript
npx tsc --version

# List available tasks
npx hardhat
```

### Local Blockchain Setup

#### Option A: Hardhat Network (Recommended for Testing)
```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local

# Terminal 3: Run tests
npm test
```

#### Option B: Hardhat Inline (Fast)
```bash
# Tests run on inline Hardhat network
npm test
```

### Sepolia Testnet Setup

#### 1. Get SepoliaETH
- Visit: https://sepoliafaucet.com/
- Or: https://faucet.sepolia.dev/
- Request test ETH for your deployer address

#### 2. Configure Infura/Alchemy
```env
# Infura
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Or Alchemy
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

#### 3. Configure Pausers
```env
# Example: 2 KMS nodes + 1 coprocessor
NUM_PAUSERS=3
PAUSER_ADDRESS_0=0x1234567890123456789012345678901234567890
PAUSER_ADDRESS_1=0x2345678901234567890123456789012345678901
PAUSER_ADDRESS_2=0x3456789012345678901234567890123456789012
```

#### 4. Deploy to Sepolia
```bash
npm run deploy:sepolia
```

#### 5. Verify Contracts
```bash
# Automatic (if VERIFY_CONTRACT=true in .env)
# Or manual:
npm run verify
```

## 🧪 Testing Guide

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx hardhat test test/PrivateVehicleInsurance.test.ts
npx hardhat test test/PauserSet.test.ts
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run with Gas Reporter
```bash
REPORT_GAS=true npm test
```

## 🔧 Development Workflow

### 1. Make Changes to Contract
```bash
# Edit contracts/PrivateVehicleInsurance.sol
code contracts/PrivateVehicleInsurance.sol
```

### 2. Compile
```bash
npm run compile
```

### 3. Run Tests
```bash
npm test
```

### 4. Check Size
```bash
npm run size
```

### 5. Deploy Locally
```bash
npm run deploy:local
```

### 6. Interact with Contract
```bash
npx hardhat run scripts/interact.ts --network localhost
```

## 📝 Common Tasks

### Create New Policy (via script)
```bash
npx hardhat run scripts/interact.ts --network sepolia
```

### Check Deployment Status
```bash
# View deployments
ls deployments/sepolia/

# Read deployment info
cat deployments/sepolia/PrivateVehicleInsurance.json
```

### Clean Build Artifacts
```bash
npm run clean
```

### Regenerate TypeChain Types
```bash
npm run typechain
```

## 🐛 Troubleshooting

### Issue: "Module not found"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Compilation failed"
```bash
# Solution: Clean and recompile
npm run clean
npm run compile
```

### Issue: "Tests failing"
```bash
# Check if contracts compiled
npm run compile

# Run tests with verbose output
npx hardhat test --verbose
```

### Issue: "Out of gas"
```bash
# Increase gas limit in hardhat.config.ts
networks: {
  sepolia: {
    gas: 6000000,
    gasPrice: 20000000000
  }
}
```

### Issue: "Nonce too low"
```bash
# Reset account nonce
npx hardhat clean
# Or use MetaMask: Settings -> Advanced -> Reset Account
```

### Issue: "Contract too large"
```bash
# Check size
npm run size

# Enable optimizer in hardhat.config.ts
solidity: {
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
```

## 🔐 Security Best Practices

### Private Key Management
```bash
# ❌ NEVER commit .env file
# ✅ Use .env.example as template
# ✅ Add .env to .gitignore
```

### Deployment Checklist
- [ ] Test on local network
- [ ] Run full test suite
- [ ] Check contract size < 24KB
- [ ] Review gas costs
- [ ] Verify .env has correct network
- [ ] Confirm sufficient testnet ETH
- [ ] Deploy to testnet
- [ ] Verify on Etherscan
- [ ] Test deployed contract
- [ ] Update frontend addresses

## 📚 Additional Resources

### Documentation
- `README.md` - Project overview
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `TECHNICAL_DOCUMENTATION.md` - Architecture details
- `PROJECT_CHECKLIST.md` - Requirements compliance

### External Links
- [Hardhat Documentation](https://hardhat.org/docs)
- [Zama FHEVM](https://docs.zama.ai/fhevm)
- [fhevmjs](https://docs.zama.ai/fhevm/fhevmjs)
- [Sepolia Testnet](https://sepolia.dev/)

## 🎯 Next Steps

After setup:
1. ✅ Run tests to verify installation
2. ✅ Deploy to local network
3. ✅ Try creating a policy
4. ✅ Submit a test claim
5. ✅ Review the code
6. ✅ Customize for your use case

## 💡 Tips

### Speed Up Tests
```bash
# Run tests in parallel (if supported)
npx hardhat test --parallel

# Skip slow tests
npx hardhat test --grep "fast"
```

### Watch Mode
```bash
# Auto-recompile on changes
npx hardhat watch compile

# Auto-test on changes
npx hardhat watch test
```

### Debug Mode
```bash
# Run with console.log support
npx hardhat test --logs
```

## 🆘 Getting Help

### Check Logs
```bash
# Hardhat verbose mode
npx hardhat test --verbose

# Show stack traces
npx hardhat test --show-stack-traces
```

### Community Support
- GitHub Issues: Report bugs
- Zama Discord: FHE questions
- Hardhat Discord: Development questions

---

**Setup Time**: ~5 minutes
**Skill Level**: Intermediate
**Prerequisites**: Node.js, Git, MetaMask

✨ **Ready to build privacy-preserving insurance!**
