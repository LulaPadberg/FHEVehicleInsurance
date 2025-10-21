# FHE Vehicle Insurance Platform

A revolutionary decentralized insurance platform built with Fully Homomorphic Encryption (FHE) technology, ensuring complete privacy and confidentiality in vehicle insurance processing and claims management.

## 🌟 Overview

This platform represents a breakthrough in insurance technology, combining blockchain transparency with cryptographic privacy. Using Zama's FHE technology, all sensitive information including personal data, claim amounts, and financial details remain encrypted throughout the entire insurance lifecycle while still enabling computational operations.

## 🔐 Core Concepts

### FHE Contract - Privacy Vehicle Insurance Claims

**Confidential Automobile Insurance Processing**: The platform utilizes Fully Homomorphic Encryption to enable privacy-preserving vehicle insurance claims processing, ensuring that all sensitive claim data remains encrypted on-chain while allowing authorized parties to perform necessary computations and validations.

#### Complete Privacy Protection
- **Personal Data Encryption**: All personal information, vehicle values, and claim amounts are encrypted and never exposed
- **Computational Privacy**: Mathematical operations on encrypted data without decryption
- **Zero Knowledge Processing**: Insurance calculations performed without revealing underlying data
- **End-to-End Confidentiality**: From policy creation to claim settlement, data remains private

#### Confidential Insurance Workflow
- **Private Policy Management**: Age, driving experience, and vehicle details encrypted on-chain
- **Secure Claims Processing**: Damage assessments and repair costs processed confidentially
- **Encrypted Risk Assessment**: AI-powered risk scoring without exposing personal information
- **Confidential Settlements**: Payout calculations performed on encrypted data

## 🚗 Key Features

### For Policyholders

- **Private Policy Creation**: Submit encrypted personal and vehicle information
- **Confidential Claims**: File claims with encrypted damage and repair cost data
- **Secure Documentation**: IPFS-based document storage with privacy protection
- **Real-time Status**: Track policy and claim status while maintaining privacy

### For Insurance Companies

- **Encrypted Risk Assessment**: Calculate risk scores on encrypted policyholder data
- **Private Claims Review**: Assess claims without accessing raw personal information
- **Secure Payout Processing**: Process settlements while maintaining data confidentiality
- **Compliance-Ready**: Meet privacy regulations while maintaining operational efficiency

### For Reviewers

- **Authorized Access**: Designated reviewers can process claims with encrypted data
- **Confidential Assessment**: Review and approve claims without compromising privacy
- **Audit Trail**: Complete transaction history with privacy preservation

## 🛡️ Privacy Protection

- **On-Chain Encryption**: All sensitive data encrypted before blockchain storage
- **Zero-Knowledge Proofs**: Verify claims validity without revealing details
- **Selective Disclosure**: Share only necessary information with authorized parties
- **GDPR Compliant**: Built-in privacy-by-design architecture

## 💡 Use Cases

### Individual Users

- Protect personal financial information during insurance applications
- Maintain privacy of driving history and vehicle details
- Secure claim processing for accidents and damages
- Confidential premium calculations

### Insurance Companies

- Reduce data breach risks through encrypted processing
- Comply with privacy regulations while maintaining efficiency
- Enable cross-border insurance with privacy guarantees
- Implement transparent yet private claim settlements

### Enterprise Fleet Management

- Bulk policy management with privacy protection
- Confidential fleet risk assessment
- Private claims processing for commercial vehicles
- Secure multi-party insurance arrangements

## 🌐 Live Demo

**Platform URL**: [https://fhe-vehicle-insurance.vercel.app/](https://fhe-vehicle-insurance.vercel.app/)

Experience the platform with:

- Interactive policy creation
- Real-time claim submission
- Encrypted data processing
- Live blockchain integration

## 📋 Contract Information

### Deployed Contracts (Sepolia Testnet)

**PrivateVehicleInsurance Contract**:

- Address: `0x2A86c562acc0a861A96E4114d7323987e313795F`
- Network: Sepolia Testnet (Chain ID: 11155111)
- Etherscan: [View Contract](https://sepolia.etherscan.io/address/0x2A86c562acc0a861A96E4114d7323987e313795F)

**PauserSet Contract**:

- Address: `0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D`
- Network: Sepolia Testnet
- Etherscan: [View Contract](https://sepolia.etherscan.io/address/0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D)

### Technology Stack

- **Smart Contracts**: Solidity 0.8.24
- **FHE Library**: Zama FHEVM v0.5.0
- **Development Framework**: Hardhat with TypeScript
- **Testing**: Hardhat Toolbox, Chai Matchers
- **Frontend**: Ethers.js v6, fhevmjs
- **Storage**: IPFS Document Storage
- **Verification**: Etherscan API Integration

## 📹 Demo Video

### demo.mp4

Complete platform walkthrough showcasing:

- Policy creation with encrypted data
- Confidential claim submission process
- Private claim review and approval
- Real-time blockchain interactions

### Platform Screenshots

Live transaction screenshots demonstrating:

- Encrypted policy creation transactions
- Private claim submission with FHE data
- Confidential review and approval processes
- Secure payout executions

## 🔧 Technical Architecture

### Smart Contract Layer

- FHE-enabled Solidity contracts
- Encrypted state management
- Private computation functions
- Access control mechanisms

### Frontend Interface

- MetaMask wallet integration
- Real-time encryption/decryption
- Responsive design for all devices
- Dynamic color theming

### Privacy Infrastructure

- Zama FHE technology integration
- Encrypted data validation
- Secure key management
- Privacy-preserving computations

## 🎯 Innovation Highlights

- **First-of-its-Kind**: Revolutionary application of FHE to insurance
- **Complete Privacy**: End-to-end encryption for all insurance data
- **Regulatory Compliance**: Built-in privacy compliance mechanisms
- **Scalable Architecture**: Designed for enterprise-level adoption
- **User-Friendly**: Complex cryptography hidden behind intuitive interface

## 🚀 Deployment & Development

### Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contracts
node scripts/verify.js --network sepolia

# Interact with contracts
node scripts/interact.js --network sepolia

# Run complete simulation
node scripts/simulate.js --network sepolia
```

### Deployment Scripts

1. **`scripts/deploy.js`** - Main deployment script
   - Deploys PauserSet contract
   - Deploys PrivateVehicleInsurance contract
   - Saves deployment information
   - Generates verification commands

2. **`scripts/verify.js`** - Contract verification
   - Verifies contracts on Etherscan
   - Automatic constructor argument handling
   - Saves verification status

3. **`scripts/interact.js`** - Contract interaction
   - Create policies
   - Submit claims
   - Authorize reviewers
   - Query contract state

4. **`scripts/simulate.js`** - Complete workflow simulation
   - Multi-user policy creation
   - Claim submission scenarios
   - Review and approval process
   - Payment processing
   - Risk score calculations

### Configuration

Create a `.env` file based on `.env.example`:

```env
# Network
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_private_key

# Etherscan
ETHERSCAN_API_KEY=your_etherscan_api_key

# FHE Configuration
NUM_PAUSERS=2
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...
```

## 🔗 Resources

**GitHub Repository**: [https://github.com/LulaPadberg/FHEVehicleInsurance](https://github.com/LulaPadberg/FHEVehicleInsurance)

**Live Platform**: [https://fhe-vehicle-insurance.vercel.app/](https://fhe-vehicle-insurance.vercel.app/)

**Smart Contracts (Sepolia)**:

- PrivateVehicleInsurance: [0x2A86c562acc0a861A96E4114d7323987e313795F](https://sepolia.etherscan.io/address/0x2A86c562acc0a861A96E4114d7323987e313795F)
- PauserSet: [0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D](https://sepolia.etherscan.io/address/0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D)

## 🏆 Awards and Recognition

This project represents a significant advancement in privacy-preserving financial technology, demonstrating the practical application of cutting-edge cryptographic techniques in real-world insurance scenarios.

## 📄 License

This project is licensed under the MIT License - promoting open innovation in privacy-preserving technologies.

---

_Built with ❤️ for a more private and secure insurance future_
