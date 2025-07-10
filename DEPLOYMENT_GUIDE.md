# 🚀 Private Vehicle Insurance Platform - Deployment Guide

## 📋 Overview

This guide covers the deployment of the Private Vehicle Insurance Platform with the latest FHE updates, including:
- ✅ KMSGeneration contract address configuration (replaces KMSManagement)
- ✅ PauserSet immutable contract integration
- ✅ Transaction input re-randomization for sIND-CPAD security
- ✅ Updated gateway contract functions (is... instead of check...)

## 🔧 Prerequisites

### Required Software
- Node.js v18+ and npm/yarn
- Hardhat or Foundry
- MetaMask or compatible Web3 wallet
- Git

### Network Requirements
- Access to Sepolia testnet
- Infura/Alchemy API key (or other RPC provider)
- Sufficient SepoliaETH for deployment

## 📝 Configuration Steps

### Step 1: Environment Setup

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

### Step 2: Configure Network Settings

```env
NETWORK=sepolia
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

⚠️ **Security Warning**: Never commit your `.env` file with real private keys!

### Step 3: Configure KMS Generation Address

**BREAKING CHANGE**: `KMS_MANAGEMENT_ADDRESS` is now **DEPRECATED**

Use the new variable:
```env
KMS_GENERATION_ADDRESS=0x1234...  # Your KMS Generation contract address
```

### Step 4: Configure PauserSet Contract

The PauserSet is an **immutable contract** that allows multiple authorized addresses to pause the main contract.

Calculate the number of pausers:
```
NUM_PAUSERS = n_kms + n_copro
```
Where:
- `n_kms` = number of registered KMS nodes
- `n_copro` = number of registered coprocessors

Example configuration:
```env
NUM_PAUSERS=3
PAUSER_ADDRESS_0=0xKMS_NODE_1_ADDRESS
PAUSER_ADDRESS_1=0xKMS_NODE_2_ADDRESS
PAUSER_ADDRESS_2=0xCOPROCESSOR_ADDRESS
```

⚠️ **DEPRECATED**: Do not use `PAUSER_ADDRESS` (without index)

### Step 5: FHE Gateway Configuration

```env
GATEWAY_CONTRACT_ADDRESS=0x...
ACL_CONTRACT_ADDRESS=0x...
KMS_CONNECTOR_KMS_GENERATION_CONTRACT_ADDRESS=${KMS_GENERATION_ADDRESS}
```

**Note**: The KMS Connector configuration variable has been renamed in `values.yaml`:
- Old: `kmsManagement`
- New: `kmsGeneration`

## 🏗️ Deployment Process

### Option 1: Deploy PauserSet First (Recommended)

```javascript
// scripts/deploy-pauser-set.js
async function main() {
  const PauserSet = await ethers.getContractFactory("PauserSet");

  const pauserAddresses = [
    process.env.PAUSER_ADDRESS_0,
    process.env.PAUSER_ADDRESS_1,
    process.env.PAUSER_ADDRESS_2
  ];

  const pauserSet = await PauserSet.deploy(pauserAddresses);
  await pauserSet.deployed();

  console.log("PauserSet deployed to:", pauserSet.address);
  return pauserSet.address;
}
```

### Option 2: Deploy Main Insurance Contract

```javascript
// scripts/deploy-insurance.js
async function main() {
  const pauserSetAddress = process.env.PAUSER_SET_ADDRESS || await deployPauserSet();

  const PrivateVehicleInsurance = await ethers.getContractFactory("PrivateVehicleInsurance");

  const insurance = await PrivateVehicleInsurance.deploy(pauserSetAddress);
  await insurance.deployed();

  console.log("PrivateVehicleInsurance deployed to:", insurance.address);
  console.log("PauserSet contract:", pauserSetAddress);

  // Verify on Etherscan
  if (process.env.VERIFY_CONTRACT === "true") {
    await hre.run("verify:verify", {
      address: insurance.address,
      constructorArguments: [pauserSetAddress]
    });
  }
}
```

### Run Deployment

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Sepolia (using main deployment script)
npx hardhat run scripts/deploy.js --network sepolia

# Or use npm scripts
npm run deploy:sepolia
```

### Deployment Scripts Overview

The project includes four main scripts for comprehensive deployment and testing:

#### 1. **`scripts/deploy.js`** - Main Deployment
Handles complete deployment process:
- Deploys PauserSet contract with configured pauser addresses
- Deploys PrivateVehicleInsurance contract
- Saves deployment information to `deployments/[network]-deployment.json`
- Generates Etherscan verification commands
- Creates environment variable files for easy reference

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### 2. **`scripts/verify.js`** - Contract Verification
Verifies deployed contracts on Etherscan:
- Loads deployment data automatically
- Verifies PauserSet contract
- Verifies PrivateVehicleInsurance contract
- Saves verification status to deployment file
- Generates Etherscan links

```bash
node scripts/verify.js --network sepolia
```

#### 3. **`scripts/interact.js`** - Contract Interaction
Demonstrates basic contract interactions:
- Query contract state and information
- Create insurance policies
- Authorize reviewers
- Submit insurance claims
- Query user policies and claims

```bash
node scripts/interact.js --network sepolia
```

#### 4. **`scripts/simulate.js`** - Complete Workflow Simulation
Simulates complete insurance workflow:
- Multiple users create policies
- Users submit various claims (Minor, Moderate, Major severity)
- Reviewers assess and approve/reject claims
- Insurance company processes payments
- Risk score calculations on encrypted data

```bash
node scripts/simulate.js --network sepolia
```

## 🔐 Security Features

### 1. Transaction Input Re-randomization

**What it does**: All transaction inputs (including state inputs) are re-encrypted before FHE operations to provide sIND-CPAD security.

**Configuration**: ✅ Automatic - No configuration required. This feature is transparent to users.

**Impact**:
- Enhanced cryptographic security
- No changes needed in dApp code
- Slightly increased gas costs (minimal)

### 2. PauserSet Security Model

The PauserSet contract allows multiple authorized entities to pause the contract:

```solidity
// Check if pause is allowed
bool canPause = await insuranceContract.isPauseAllowed();

// Pause contract (only callable by authorized pausers)
await pauserSetContract.pause();

// Unpause contract
await pauserSetContract.unpause();
```

**Authorization Flow**:
```
KMS Node 1 ──┐
KMS Node 2 ──┼──> PauserSet Contract ──> Insurance Contract
Coprocessor ─┘
```

### 3. Gateway Function Migration

**BREAKING CHANGE**: All `check...` view functions have been replaced with `is...` functions.

| ❌ Deprecated | ✅ New Function | Return Type |
|--------------|----------------|-------------|
| `checkPublicDecryptAllowed()` | `isPublicDecryptAllowed()` | `bool` |
| Reverts with `PublicDecryptNotAllowed` | Returns `false` | No revert |

**Migration Example**:

```javascript
// OLD (deprecated)
try {
  await gatewayContract.checkPublicDecryptAllowed();
  // Proceed with decryption
} catch (error) {
  // Handle error
}

// NEW (recommended)
const isAllowed = await gatewayContract.isPublicDecryptAllowed();
if (isAllowed) {
  // Proceed with decryption
} else {
  // Handle denied case
}
```

## 🧪 Testing

### Test PauserSet Functionality

```javascript
describe("PauserSet Integration", function() {
  it("Should allow authorized pauser to pause contract", async function() {
    const [owner, pauser1] = await ethers.getSigners();

    // Deploy contracts
    const pauserSet = await deployPauserSet([pauser1.address]);
    const insurance = await deployInsurance(pauserSet.address);

    // Pause from authorized pauser
    await pauserSet.connect(pauser1).pause();

    // Verify contract is paused
    expect(await insurance.isPaused()).to.be.true;

    // Attempt transaction - should fail
    await expect(
      insurance.createPolicy(25, 5, 20000, 500)
    ).to.be.revertedWith("Contract is paused");
  });
});
```

### Run Tests

```bash
npx hardhat test
npx hardhat coverage
```

## 📊 Post-Deployment Verification

### 1. Verify Contract Configuration

```javascript
const insurance = await ethers.getContractAt(
  "PrivateVehicleInsurance",
  DEPLOYED_ADDRESS
);

console.log("Insurance Company:", await insurance.insuranceCompany());
console.log("PauserSet Contract:", await insurance.pauserSetContract());
console.log("Is Paused:", await insurance.isPaused());
console.log("Pause Allowed:", await insurance.isPauseAllowed());
```

### 2. Test FHE Operations

```javascript
// Create a policy with encrypted data
const tx = await insurance.createPolicy(
  30,     // age
  10,     // driving years
  25000,  // vehicle value
  1200    // premium
);

const receipt = await tx.wait();
console.log("Policy created with encryption:", receipt.events);
```

### 3. Verify Gateway Integration

```javascript
// Check gateway functions are using new is... pattern
const gatewayContract = await ethers.getContractAt("Gateway", GATEWAY_ADDRESS);
const isAllowed = await gatewayContract.isPublicDecryptAllowed();
console.log("Decryption allowed:", isAllowed);
```

## 🔄 Upgrading from Previous Version

### Migration Checklist

- [ ] Update environment variables (remove deprecated ones)
- [ ] Deploy new PauserSet contract
- [ ] Update contract constructor to accept PauserSet address
- [ ] Add `whenNotPaused` modifiers to sensitive functions
- [ ] Replace `check...` calls with `is...` functions
- [ ] Update frontend to handle new pause mechanism
- [ ] Test all FHE operations with re-randomization
- [ ] Update documentation and API references

### Environment Variable Migration

```bash
# OLD .env
PAUSER_ADDRESS=0x...
KMS_MANAGEMENT_ADDRESS=0x...

# NEW .env
NUM_PAUSERS=2
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...
KMS_GENERATION_ADDRESS=0x...
```

## 🔗 Deployed Contract Information

### Sepolia Testnet Deployment

**PrivateVehicleInsurance Contract**
- Address: `0x07e59aEcC74578c859a89a4CD7cD40E760625890`
- Network: Sepolia (Chain ID: 11155111)
- Deployed: 2025-10-23
- Etherscan: [View Contract](https://sepolia.etherscan.io/address/0x07e59aEcC74578c859a89a4CD7cD40E760625890)

**PauserSet Contract**
- Address: `0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D`
- Network: Sepolia (Chain ID: 11155111)
- Deployed: 2025-10-23
- Etherscan: [View Contract](https://sepolia.etherscan.io/address/0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D)

### Verification Commands

After deployment, verify contracts using:

```bash
# Verify PauserSet
npx hardhat verify --network sepolia <PAUSERSET_ADDRESS> "[\"<PAUSER_0>\",\"<PAUSER_1>\"]"

# Verify PrivateVehicleInsurance
npx hardhat verify --network sepolia <INSURANCE_ADDRESS> "<PAUSERSET_ADDRESS>"

# Or use the automated verification script
node scripts/verify.js --network sepolia
```

## 📚 Additional Resources

### Documentation
- [Zama FHE Documentation](https://docs.zama.ai)
- [Gateway Contract Reference](https://docs.zama.ai/fhevm/gateway)
- [KMS Generation Guide](https://docs.zama.ai/fhevm/kms-generation)
- [Hardhat Documentation](https://hardhat.org/docs)

### Project Resources
- GitHub Repository: [PrivateVehicleInsurance](https://github.com/LulaPadberg/PrivateVehicleInsurance)
- Live Platform: [https://private-vehicle-insurance.vercel.app/](https://private-vehicle-insurance.vercel.app/)

### Support
- GitHub Issues: Report bugs or request features
- Community: Join Zama Discord

## ⚠️ Important Notes

1. **Immutable PauserSet**: The `pauserSetContract` address is set in the constructor and cannot be changed. Plan your pauser addresses carefully.

2. **Gas Costs**: Re-randomization increases gas costs slightly. Test thoroughly on testnet before mainnet deployment.

3. **Backward Compatibility**: The new `is...` functions are not backward compatible with `check...` functions. Update all calling code.

4. **Security Audit**: Always audit contracts before mainnet deployment, especially when handling encrypted sensitive data.

## 🎯 Success Criteria

Your deployment is successful when:

✅ PauserSet contract deployed with correct pauser addresses
✅ Insurance contract deployed with PauserSet integration
✅ All FHE operations work with re-randomization
✅ Pause/unpause functionality works from authorized addresses
✅ Gateway integration uses new `is...` functions
✅ Frontend successfully creates policies and claims
✅ Encrypted data properly stored and retrieved
✅ All tests passing

---

**Last Updated**: 2025-10-23
**Contract Version**: v2.0.0 (with PauserSet)
**Network**: Sepolia Testnet
