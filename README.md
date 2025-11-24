# Private Escrow System with Advanced FHE Features

A cutting-edge privacy-preserving escrow and marketplace system built on Fully Homomorphic Encryption (FHE), featuring innovative solutions for decryption failures, timeout protection, and privacy-preserving calculations.

Live Demo: https://fhe-vehicle-insurance.vercel.app/

## Key Features

### Core Innovations

- **Refund Mechanism**: Automatic refunds when decryption fails or times out
- **Timeout Protection**: Prevents permanent fund locks with multiple timeout tiers
- **Gateway Callback Pattern**: Asynchronous decryption handling with built-in failure recovery
- **Privacy-Preserving Division**: Random multiplier technique prevents information leakage
- **Price Obfuscation**: Noise injection to hide sensitive price patterns
- **Gas Optimization**: Efficient HCU (Homomorphic Computation Unit) usage

### Security Features

- **Input Validation**: Comprehensive checks on all external inputs
- **Access Control**: Role-based permissions (buyer, seller, owner)
- **Overflow Protection**: Built-in Solidity 0.8.24 safety checks
- **Audit Trail**: Detailed event emissions for all state changes

## Architecture

### Contracts

1. **PrivateEscrowWithRefund**: Secure escrow with refund and timeout mechanisms
2. **PrivacyPreservingMarket**: Marketplace with advanced privacy-preserving calculations

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

### Creating an Escrow

```javascript
import { createEscrow } from './utils/escrow';

// Encrypt sensitive data
const encryptedAmount = await fhevm.encrypt(1000000); // 1M units
const encryptedPrice = await fhevm.encrypt(5000);
const proof = await fhevm.generateProof([encryptedAmount, encryptedPrice]);

// Create escrow
const tx = await escrowContract.createEscrow(
    sellerAddress,
    encryptedAmount,
    encryptedPrice,
    proof,
    86400, // 24 hours timeout
    { value: ethers.parseEther("0.1") }
);

const receipt = await tx.wait();
const escrowId = receipt.events[0].args.escrowId;
console.log(`Escrow created: ${escrowId}`);
```

### Requesting Decryption

```javascript
// Request Gateway decryption
const tx = await escrowContract.requestDecryption(escrowId);
await tx.wait();

// Listen for completion
escrowContract.on("EscrowCompleted", (id, amount) => {
    if (id === escrowId) {
        console.log(`Escrow completed with amount: ${amount}`);
    }
});

// Listen for refunds
escrowContract.on("EscrowRefunded", (id, reason) => {
    if (id === escrowId) {
        console.log(`Escrow refunded: ${reason}`);
    }
});
```

### Handling Timeouts

```javascript
// Check if timed out
const timedOut = await escrowContract.isTimedOut(escrowId);

if (timedOut) {
    // Trigger timeout to recover funds
    const tx = await escrowContract.triggerTimeout(escrowId);
    await tx.wait();
    console.log("Timeout triggered, funds refunded");
}
```

### Marketplace Usage

```javascript
// Seller creates listing
const listingTx = await marketContract.createListing(
    encryptedPrice,
    encryptedQuantity,
    proof
);
const listingId = (await listingTx.wait()).events[0].args.listingId;

// Buyer places order
const orderTx = await marketContract.placeOrder(
    listingId,
    encryptedQuantity,
    proof,
    { value: paymentAmount }
);
const orderId = (await orderTx.wait()).events[0].args.orderId;

// Request decryption
await marketContract.requestOrderDecryption(orderId);
```

## Privacy Techniques Explained

### 1. Privacy-Preserving Division

**Problem**: Division on encrypted values can leak information

**Solution**: Random Multiplier Technique

```solidity
// Multiply by random factor before division
uint256 multiplier = randomValue % 10000 + 1;
euint64 scaledValue = FHE.mul(encryptedValue, FHE.asEuint64(multiplier));

// After decryption, divide by same multiplier
uint256 trueValue = decryptedScaledValue / multiplier;
```

### 2. Price Obfuscation

**Problem**: Price patterns can reveal business strategies

**Solution**: Noise Injection

```solidity
// Add random noise to price
uint256 noise = randomValue % 1000;
euint64 obfuscatedPrice = FHE.add(basePrice, FHE.asEuint64(noise));

// Noise is removed during decryption
```

### 3. Gateway Callback Pattern

**Problem**: FHE decryption is async and may fail

**Solution**: Request-Callback with Timeout

```
User Request → Gateway Processing → Callback (success or timeout)
```

## Constants Reference

### Timeout Values

- `MIN_TIMEOUT`: 1 hour (minimum escrow duration)
- `MAX_TIMEOUT`: 30 days (maximum escrow duration)
- `DECRYPTION_TIMEOUT`: 2 hours (Gateway response deadline)
- `ORDER_TIMEOUT`: 1 hour (marketplace order timeout)

### Privacy Parameters

- `OBFUSCATION_RANGE`: 1000 (noise range for obfuscation)
- `PRICE_MULTIPLIER_RANGE`: 10000 (multiplier range for division)
- `OBFUSCATION_NOISE_MAX`: 1000 (maximum noise value)

### Fees

- Platform Fee: 2.5% (250 basis points)
- Adjustable by owner (max 10%)

## Events

### PrivateEscrowWithRefund

```solidity
event EscrowCreated(bytes32 indexed escrowId, address indexed buyer, address indexed seller, uint256 timeout);
event DecryptionRequested(bytes32 indexed escrowId, uint256 requestId);
event EscrowCompleted(bytes32 indexed escrowId, uint256 amount);
event EscrowRefunded(bytes32 indexed escrowId, string reason);
event EscrowCancelled(bytes32 indexed escrowId);
event TimeoutTriggered(bytes32 indexed escrowId);
event FeesWithdrawn(address indexed to, uint256 amount);
```

### PrivacyPreservingMarket

```solidity
event ListingCreated(bytes32 indexed listingId, address indexed seller);
event OrderPlaced(bytes32 indexed orderId, bytes32 indexed listingId, address indexed buyer);
event DecryptionRequested(bytes32 indexed orderId, uint256 requestId);
event OrderCompleted(bytes32 indexed orderId, uint256 finalPrice);
event OrderRefunded(bytes32 indexed orderId, string reason);
event ListingCancelled(bytes32 indexed listingId);
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

| Operation | Estimated Gas | HCU Cost |
|-----------|--------------|----------|
| Create Escrow | ~200k | Medium |
| Request Decryption | ~150k | High |
| Trigger Timeout | ~50k | None |
| Cancel Escrow | ~50k | None |
| Create Listing | ~180k | Medium |
| Place Order | ~160k | High |

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
dapp/
├── contracts/              # Solidity contracts
│   ├── PrivateEscrowWithRefund.sol
│   └── PrivacyPreservingMarket.sol
├── test/                   # Test files
│   └── PrivateEscrow.test.ts
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
