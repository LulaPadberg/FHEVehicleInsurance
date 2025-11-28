# Private Vehicle Insurance Platform

A revolutionary decentralized insurance platform built with Fully Homomorphic Encryption (FHE) technology, ensuring complete privacy and confidentiality in vehicle insurance processing and claims management.

## 🌟 Overview

This platform represents a breakthrough in insurance technology, combining blockchain transparency with cryptographic privacy. Using Zama's FHE technology, all sensitive information including personal data, claim amounts, and financial details remain encrypted throughout the entire insurance lifecycle while still enabling computational operations.

Live Demo : https://fhe-vehicle-insurance.vercel.app/   
Video : demo.mp4

## 🔐 Core Features

### Advanced FHE Innovations

#### 1. Gateway Callback Pattern
- **Asynchronous Decryption**: Claims processing uses Gateway callback for secure decryption
- **Request-Response Model**: User submits → Contract records → Gateway decrypts → Callback completes transaction
- **Signature Verification**: All callbacks verified using `FHE.checkSignatures()`

#### 2. Refund Mechanism
- **Automatic Refund**: Handles decryption failures gracefully
- **Timeout Detection**: If Gateway doesn't respond within DECRYPTION_TIMEOUT (2 hours), claim is refunded
- **Status Tracking**: Claims can be in `RefundPending` or `Refunded` status

#### 3. Timeout Protection
- **Three-Tier System**:
  - `MIN_TIMEOUT`: 1 hour (minimum claim duration)
  - `MAX_TIMEOUT`: 30 days (maximum claim duration)
  - `DECRYPTION_TIMEOUT`: 2 hours (Gateway response deadline)
- **Manual Trigger**: Users can trigger `triggerClaimTimeout()` for stuck claims
- **Prevents Lock**: No funds permanently locked

#### 4. Privacy-Preserving Division
- **Problem**: Division on encrypted values can leak information
- **Solution**: Random multiplier technique
  - Generate unique random multiplier (1-10000) per claim
  - Multiply repair cost by multiplier before encryption
  - Divide by same multiplier after decryption
  - Result is accurate, intermediate values are obfuscated

#### 5. Price Obfuscation
- **Noise Injection**: Damage amounts masked with random noise (0-1000)
- **Pattern Hiding**: Prevents chain analysis of claim amounts
- **Deterministic Removal**: Noise stored and removed during callback

#### 6. Enhanced Security
- **Input Validation**: All addresses, amounts, and timeouts validated
- **Access Control**: Role-based permissions (insurance company, reviewers, claimants)
- **Overflow Protection**: Solidity 0.8.24 built-in checks
- **Audit Trail**: Comprehensive event emissions for all state changes

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

**Smart Contract Address**: `0x2A86c562acc0a861A96E4114d7323987e313795F`

### Technology Stack

- **Solidity**: ^0.8.24
- **FHE Library**: @fhevm/solidity v0.8.0
- **Frontend**: React 19 + TypeScript + Vite
- **Testing**: Hardhat + Chai
- **Network**: Incentiv Testnet (Sepolia compatible)

## Installation

```bash
# Clone repository
git clone <repository-url>
cd dapp


# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your private key and RPC URLs
```

## Configuration

Create `.env` file:

```env
VITE_PRIVATE_KEY=your_private_key_here
VITE_INCENTIV_RPC_URL=https://rpc.testnet.incentiv.net
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

## Compilation

```bash
# Compile contracts
npm run compile

# Verify compilation
npx hardhat compile
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/PrivateEscrow.test.ts

# Run with gas reporting
REPORT_GAS=true npm test
```

## Deployment

### Testnet Deployment

```bash
# Deploy to Incentiv testnet
npx hardhat run scripts/deploy.ts --network incentiv

# Verify on explorer
npx hardhat verify --network incentiv <CONTRACT_ADDRESS>
```

### Local Development

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to localhost
npx hardhat run scripts/deploy.ts --network localhost
```

## Usage Examples

### Creating a Policy

```javascript
import { createPolicy } from './utils/insurance';

// Create policy with encrypted data
const tx = await insuranceContract.createPolicy(
    25,        // age
    5,         // driving years
    30000,     // vehicle value
    500        // premium
);

const receipt = await tx.wait();
const policyId = receipt.events[0].args.policyId;
console.log(`Policy created: ${policyId}`);
```

### Submitting a Claim with Gateway Callback

```javascript
// Submit claim with timeout and privacy features
const tx = await insuranceContract.submitClaim(
    policyId,
    5000,              // damage amount (will be obfuscated)
    3000,              // repair cost (will use privacy-preserving division)
    0,                 // AccidentSeverity.Minor
    "QmHash...",       // IPFS document hash
    true,              // is confidential
    86400              // timeout: 24 hours
);

const claimId = (await tx.wait()).events[0].args.claimId;
console.log(`Claim submitted: ${claimId}`);
```

### Requesting Gateway Decryption

```javascript
// After claim is approved, request decryption
const tx = await insuranceContract.requestClaimDecryption(claimId);
await tx.wait();

// Listen for decryption completion
insuranceContract.on("DecryptionCompleted", (id, approvedAmount) => {
    if (id === claimId) {
        console.log(`Claim ${id} decrypted: ${approvedAmount}`);
    }
});

// Listen for refunds (in case of timeout)
insuranceContract.on("ClaimRefunded", (id, recipient, reason) => {
    if (id === claimId) {
        console.log(`Claim ${id} refunded: ${reason}`);
    }
});
```

### Handling Timeouts

```javascript
// Check if claim timed out
const timedOut = await insuranceContract.isClaimTimedOut(claimId);

if (timedOut) {
    // Trigger timeout to recover from stuck state
    const tx = await insuranceContract.triggerClaimTimeout(claimId);
    await tx.wait();
    console.log("Timeout triggered, claim refunded");
}
```

### Checking Decryption Status

```javascript
// Get detailed decryption status
const { requested, callbackReceived, requestId, timeoutDeadline } =
    await insuranceContract.getDecryptionStatus(claimId);

console.log(`Decryption requested: ${requested}`);
console.log(`Callback received: ${callbackReceived}`);
console.log(`Timeout deadline: ${new Date(timeoutDeadline * 1000)}`);
```

## Privacy Techniques Explained

### 1. Privacy-Preserving Division

**Problem**: Division on encrypted values can leak information

**Solution**: Random Multiplier Technique

```solidity
// Generate random multiplier (1-10000)
uint256 multiplier = (keccak256(...) % PRICE_MULTIPLIER_RANGE) + 1;

// Multiply repair cost before encryption
uint32 scaledRepairCost = repairCost * multiplier / 1000;
euint32 encrypted = FHE.asEuint32(scaledRepairCost);

// After Gateway decryption, divide by multiplier
uint32 trueRepairCost = decrypted * 1000 / multiplier;
```

### 2. Price Obfuscation

**Problem**: Damage amount patterns can reveal claim strategies

**Solution**: Noise Injection

```solidity
// Generate random noise (0-1000)
uint256 noise = keccak256(...) % OBFUSCATION_NOISE_MAX;

// Add noise to damage amount
euint32 obfuscated = FHE.add(damageAmount, FHE.asEuint32(noise));

// Store noise for removal in callback
claim.obfuscationNoise = noise;

// Remove noise after decryption
uint32 trueDamage = decrypted - noise;
```

### 3. Gateway Callback Pattern

**Problem**: FHE decryption is async and may fail

**Solution**: Request-Callback with Timeout Protection

```
User Request → Contract Records → Gateway Decryption → Callback Completes

Timeout Protection:
- If Gateway doesn't respond within DECRYPTION_TIMEOUT
- Claim automatically refunded
- User can manually trigger timeout
```

## Constants Reference

### Timeout Values

- `MIN_TIMEOUT`: 1 hour (minimum claim duration)
- `MAX_TIMEOUT`: 30 days (maximum claim duration)
- `DECRYPTION_TIMEOUT`: 2 hours (Gateway response deadline)

### Privacy Parameters

- `OBFUSCATION_NOISE_MAX`: 1000 (noise range for damage obfuscation)
- `PRICE_MULTIPLIER_RANGE`: 10000 (multiplier range for privacy-preserving division)

## Events

### PrivateVehicleInsurance

```solidity
event PolicyCreated(uint256 indexed policyId, address indexed holder);
event ClaimSubmitted(uint256 indexed claimId, uint256 indexed policyId, address indexed claimant);
event ClaimReviewed(uint256 indexed claimId, address indexed reviewer, ClaimStatus newStatus);
event ClaimApproved(uint256 indexed claimId, uint256 approvedAmount);
event ClaimPaid(uint256 indexed claimId, address indexed recipient);
event ClaimRefunded(uint256 indexed claimId, address indexed recipient, string reason);
event DecryptionRequested(uint256 indexed claimId, uint256 requestId);
event DecryptionCompleted(uint256 indexed claimId, uint256 approvedAmount);
event TimeoutTriggered(uint256 indexed claimId);
event ReviewerAuthorized(address indexed reviewer);
event ReviewerRevoked(address indexed reviewer);
event ContractPaused(address indexed pauser);
event ContractUnpaused(address indexed pauser);
```

## Troubleshooting

### Common Issues

**Decryption Timeout**
- Gateway may be down or overloaded
- Check Gateway status before requesting decryption
- System will auto-refund after DECRYPTION_TIMEOUT

**Transaction Reverted**
- Verify timeout hasn't passed
- Check you have correct permissions (buyer/seller)
- Ensure sufficient gas and funds

**Invalid Timeout**
- Must be between MIN_TIMEOUT (1 hour) and MAX_TIMEOUT (30 days)
- Use values in seconds

## Gas Estimates

| Operation | Estimated Gas | HCU Cost | Notes |
|-----------|--------------|----------|-------|
| Create Policy | ~180k | Medium | Multiple FHE encryptions |
| Submit Claim | ~200k | Medium | Obfuscation + encryption |
| Review Claim | ~150k | Medium | Encrypted assessment |
| Request Decryption | ~150k | High | Gateway request |
| Trigger Timeout | ~50k | None | Pure cleartext |
| Process Payment | ~50k | None | Status update only |

## Security Considerations

1. **Always validate inputs**: Check addresses, amounts, and timeouts
2. **Monitor events**: Listen for refunds and completions
3. **Handle timeouts**: Implement timeout monitoring in your app
4. **Test thoroughly**: Use testnet before mainnet deployment
5. **Audit contracts**: Have contracts audited before production use

## Documentation

- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API_DOCUMENTATION.md)

## Development

### Project Structure

```
project/
├── contracts/              # Solidity contracts
│   ├── PrivateVehicleInsurance.sol    # Main insurance contract
│   └── PauserSet.sol                  # Pauser management
├── test/                   # Test files
│   └── PrivateVehicleInsurance.test.ts
├── src/                    # Frontend source
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utility functions
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md
│   └── API_DOCUMENTATION.md
└── hardhat.config.cjs     # Hardhat configuration
```

### Running Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

BSD-3-Clause-Clear

## Acknowledgments

- Built with [@fhevm/solidity](https://github.com/zama-ai/fhevm)
- Powered by [Incentiv Network](https://incentiv.network)
- FHE technology by [Zama](https://zama.ai)

## Support

For issues or questions:
- Open an issue on GitHub
- Check documentation in `/docs`
- Review test files for usage examples

---

**Note**: This system uses advanced cryptographic techniques. Always test thoroughly on testnet before deploying to mainnet. The refund mechanisms and timeout protection are designed to keep user funds safe, but proper monitoring and error handling in your application are essential.
