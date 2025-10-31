# FHE Vehicle Insurance Platform

A revolutionary decentralized insurance platform built with Fully Homomorphic Encryption (FHE) technology, ensuring complete privacy and confidentiality in vehicle insurance processing and claims management.

## 🌟 Overview

This platform represents a breakthrough in insurance technology, combining blockchain transparency with cryptographic privacy. Using Zama's FHE technology, all sensitive information including personal data, claim amounts, and financial details remain encrypted throughout the entire insurance lifecycle while still enabling computational operations.

## 🌐 Live Demo

**Platform URL**: [https://fhe-vehicle-insurance.vercel.app/](https://fhe-vehicle-insurance.vercel.app/)

Experience the platform with:

- Interactive policy creation
- Real-time claim submission
- Encrypted data processing
- Live blockchain integration
- Modern React interface (or legacy HTML)

## 📹 Demo Video

### demo.mp4

Complete platform walkthrough showcasing:

- Policy creation with encrypted data
- Confidential claim submission process
- Private claim review and approval
- Real-time blockchain interactions



## 🔐 Core Concepts

### Universal FHEVM SDK Integration (NEW)

The modern React application integrates the **Universal FHEVM SDK** (`@fhevm/universal-sdk`), providing:

- **Framework-Agnostic Core**: Works with React, Vue, or vanilla JavaScript
- **Wagmi-like API**: Familiar React hooks interface for web3 developers
- **Easy Integration**: Less than 10 lines of code to get started
- **Type-Safe**: Full TypeScript support with intelligent type inference
- **Built-in Hooks**: `useFhevmClient`, `useEncrypt`, `useDecrypt` for React

**Example Usage:**
```typescript
import { useFhevmClient, useEncrypt } from '@fhevm/universal-sdk/react';

// Initialize FHEVM
const { client, isReady } = useFhevmClient({
  network: { chainId: 11155111, rpcUrl: '...', name: 'Sepolia' }
});

// Encrypt data
const { encryptValue } = useEncrypt();
const encrypted = await encryptValue('uint32', 25000);
```

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

## 🚀 Quick Start

### Try the Modern React Application

```bash
# Clone or navigate to the project
cd D:\

# Navigate to React frontend
cd private-vehicle-insurance

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3001 in your browser
```

### Try the Legacy HTML Application

```bash
# Simply open in browser
open PrivateVehicleInsurance/index.html

# Or use any HTTP server
cd PrivateVehicleInsurance
npx http-server -p 8080
```



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

#### Smart Contract Layer
- **Smart Contracts**: Solidity 0.8.24
- **FHE Library**: Zama FHEVM v0.5.0
- **Development Framework**: Hardhat with TypeScript
- **Testing**: Hardhat Toolbox, Chai Matchers
- **Verification**: Etherscan API Integration

#### Frontend Applications

**Modern React Application** (`private-vehicle-insurance/`)
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **FHE SDK**: @fhevm/universal-sdk (Universal FHEVM SDK)
- **Web3**: Ethers.js v6.4.0
- **Development**: Hot Module Replacement, TypeScript 5.5
- **Build**: Next.js production optimization
- **Features**:
  - Client-side FHE encryption using Universal SDK
  - React hooks for FHE operations (useFhevmClient, useEncrypt)
  - Modern component architecture
  - Responsive design with Tailwind
  - Type-safe development
  - MetaMask integration
  - Real-time status updates

**Static HTML Reference** (Legacy)
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript
- **Web3**: Ethers.js v5.7.2 (CDN)
- **FHE**: fhevmjs (direct integration)
- **Design**: Gradient UI with dynamic theming
- **Features**: Zero build process, instant deployment

#### Storage & Infrastructure
- **Document Storage**: IPFS
- **Blockchain Network**: Ethereum Sepolia Testnet
- **RPC Provider**: Infura
- **Deployment**: Vercel (Frontend), Hardhat (Contracts)



## 🔧 Technical Architecture

### Project Structure

```
D:\/
├── contracts/                          # Smart contracts
│   ├── PrivateVehicleInsurance.sol    # Main insurance contract
│   └── PauserSet.sol                  # Emergency pause control
├── scripts/                            # Deployment & interaction scripts
│   ├── deploy.js                      # Contract deployment
│   ├── verify.js                      # Etherscan verification
│   ├── interact.js                    # Contract interaction
│   └── simulate.js                    # Workflow simulation
├── test/                               # Contract tests
│   ├── PrivateVehicleInsurance.test.ts
│   └── PauserSet.test.ts
├── private-vehicle-insurance/          # Modern React Frontend (NEW)
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Main application
│   │   └── globals.css                # Global styles
│   ├── package.json                   # Dependencies (Next.js, SDK)
│   ├── tsconfig.json                  # TypeScript config
│   └── tailwind.config.ts             # Tailwind config
├── PrivateVehicleInsurance/            # Legacy HTML Frontend
│   └── index.html                     # Static application
├── hardhat.config.ts                   # Hardhat configuration
└── package.json                        # Project dependencies
```

### Smart Contract Layer

- FHE-enabled Solidity contracts
- Encrypted state management
- Private computation functions
- Access control mechanisms

### Frontend Applications

**Modern React Stack** (private-vehicle-insurance/)
- Next.js 14 App Router architecture
- Universal FHEVM SDK integration
- React hooks for FHE operations
- TypeScript for type safety
- Tailwind CSS for styling
- MetaMask wallet integration
- Real-time encryption/decryption
- Responsive design for all devices

**Legacy HTML Stack** (PrivateVehicleInsurance/)
- Pure HTML/CSS/JavaScript
- Direct fhevmjs integration
- Zero build process
- Dynamic color theming
- MetaMask integration

### Privacy Infrastructure

- Zama FHE technology integration
- Client-side encryption via Universal SDK
- Encrypted data validation
- Secure key management
- Privacy-preserving computations

## 📊 Frontend Comparison

| Feature | Modern React App | Legacy HTML App |
|---------|-----------------|-----------------|
| **Framework** | Next.js 14 + React 18 | Vanilla JavaScript |
| **FHE Integration** | Universal FHEVM SDK | Direct fhevmjs |
| **Language** | TypeScript | JavaScript |
| **Styling** | Tailwind CSS | Inline CSS |
| **Build Process** | Yes (optimized) | No (instant) |
| **Hot Reload** | ✅ Yes | ❌ No |
| **Type Safety** | ✅ Yes | ❌ No |
| **SEO** | ✅ Optimized | ⚠️ Basic |
| **Bundle Size** | Optimized chunks | Single file |
| **Development** | Modern tooling | Simple editor |
| **Production** | Vercel/Node.js | Any web server |
| **Maintenance** | Easy (modular) | Moderate |
| **Best For** | Production apps | Quick demos |

**Recommendation:** Use the **Modern React App** for production deployments and the **Legacy HTML App** for quick testing or demonstrations.

### When to Use Each Frontend

**Choose Modern React App if you:**
- 🏢 Building a production application
- 🔧 Need a modern development workflow
- 📱 Require responsive, mobile-friendly UI
- 🔐 Want integrated Universal FHEVM SDK
- ⚡ Need hot module replacement
- 🎯 Require SEO optimization
- 📦 Want code splitting and optimization
- 🛠️ Need TypeScript type safety

**Choose Legacy HTML App if you:**
- 🚀 Need quick deployment
- 📝 Want to study FHE integration basics
- 🎓 Learning FHE concepts
- 🔬 Prototyping or testing
- 📊 Creating demos or presentations
- 💻 No build tools available
- 🌐 Need maximum browser compatibility
- ⚡ Want instant page loads

## 🎯 Innovation Highlights

- **First-of-its-Kind**: Revolutionary application of FHE to insurance
- **Dual Frontend Architecture**: Both modern and legacy implementations
- **Complete Privacy**: End-to-end encryption for all insurance data
- **Universal SDK Integration**: Leveraging latest FHE development tools
- **Regulatory Compliance**: Built-in privacy compliance mechanisms
- **Scalable Architecture**: Designed for enterprise-level adoption
- **User-Friendly**: Complex cryptography hidden behind intuitive interface
- **Developer Choice**: Flexible deployment options for different use cases

## 🚀 Deployment & Development

### Smart Contract Development

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

### Frontend Development

#### Modern React Application (Recommended)

```bash
# Navigate to React app
cd private-vehicle-insurance

# Install dependencies
npm install

# Run development server
npm run dev
# Visit http://localhost:3001

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Lint code
npm run lint
```

**Key Features:**
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast refresh during development
- 🔐 Integrated Universal FHEVM SDK
- 📱 Fully responsive design
- 🔒 Type-safe development with TypeScript
- 🚀 Production-ready builds
- 🎯 SEO optimized

#### Legacy HTML Application

```bash
# Simply open in browser
open PrivateVehicleInsurance/index.html

# Or serve with any HTTP server
npx http-server PrivateVehicleInsurance -p 8080
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
