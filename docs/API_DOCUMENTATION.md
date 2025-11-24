# API Documentation - Private Escrow System

## Table of Contents

1. [PrivateEscrowWithRefund Contract](#privateescrowwithrefund-contract)
2. [PrivacyPreservingMarket Contract](#privacypreservingmarket-contract)
3. [Common Patterns](#common-patterns)
4. [Error Handling](#error-handling)
5. [Events Reference](#events-reference)

---

## PrivateEscrowWithRefund Contract

### Core Functions

#### `createEscrow`

Creates a new escrow transaction with encrypted amount and timeout protection.

```solidity
function createEscrow(
    address seller,
    externalEuint64 encryptedAmount,
    externalEuint64 encryptedPrice,
    bytes calldata inputProof,
    uint256 timeout
) external payable returns (bytes32 escrowId)
```

**Parameters**:
- `seller`: Address of the seller receiving funds
- `encryptedAmount`: Encrypted transaction amount (FHE encrypted)
- `encryptedPrice`: Encrypted price with obfuscation
- `inputProof`: Zero-knowledge proof for encrypted inputs
- `timeout`: Duration in seconds (MIN_TIMEOUT to MAX_TIMEOUT)

**Returns**: `escrowId` - Unique identifier for the escrow

**Requirements**:
- `seller` must be valid address and different from buyer
- `msg.value` must be greater than 0
- `timeout` must be between 1 hour and 30 days

**Events**: Emits `EscrowCreated`

**Example**:
```javascript
const encryptedAmount = await fhevm.encrypt(1000000); // 1 USDC
const encryptedPrice = await fhevm.encrypt(5000);
const proof = await fhevm.generateProof([encryptedAmount, encryptedPrice]);

const tx = await escrowContract.createEscrow(
    sellerAddress,
    encryptedAmount,
    encryptedPrice,
    proof,
    86400, // 24 hours
    { value: ethers.utils.parseEther("0.1") }
);

const receipt = await tx.wait();
const escrowId = receipt.events[0].args.escrowId;
```

---

#### `requestDecryption`

Requests Gateway to decrypt the escrow amount for finalization.

```solidity
function requestDecryption(bytes32 escrowId) external
```

**Parameters**:
- `escrowId`: The escrow transaction identifier

**Requirements**:
- Caller must be buyer or seller
- Escrow status must be `Active`
- Must be before timeout

**Events**: Emits `DecryptionRequested`

**Gas Cost**: ~150k gas + HCU costs for FHE operations

**Example**:
```javascript
const tx = await escrowContract.requestDecryption(escrowId);
await tx.wait();

// Gateway will automatically call back within DECRYPTION_TIMEOUT (2 hours)
```

---

#### `decryptionCallback`

Gateway callback function to handle decryption results. **Called automatically by Gateway**.

```solidity
function decryptionCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Parameters**:
- `requestId`: The decryption request identifier
- `cleartexts`: ABI-encoded decrypted values
- `decryptionProof`: Cryptographic proof of valid decryption

**Internal Behavior**:
- Verifies decryption signatures
- Checks for timeout
- Completes transaction or triggers refund
- Transfers funds to seller

**Events**: Emits `EscrowCompleted` or `EscrowRefunded`

---

#### `triggerTimeout`

Manually trigger timeout for expired escrows to recover funds.

```solidity
function triggerTimeout(bytes32 escrowId) external
```

**Parameters**:
- `escrowId`: The escrow identifier

**Requirements**:
- Current time >= escrow timeout
- Status must be Active or AwaitingDecrypt

**Events**: Emits `TimeoutTriggered`, `EscrowRefunded`

**Example**:
```javascript
// After timeout period has passed
const tx = await escrowContract.triggerTimeout(escrowId);
await tx.wait();
// Buyer receives refund
```

---

#### `cancelEscrow`

Cancel an active escrow (buyer only, before decryption).

```solidity
function cancelEscrow(bytes32 escrowId) external
```

**Parameters**:
- `escrowId`: The escrow identifier

**Requirements**:
- Caller must be the buyer
- Status must be `Active`

**Events**: Emits `EscrowCancelled`, `EscrowRefunded`

**Example**:
```javascript
const tx = await escrowContract.cancelEscrow(escrowId);
await tx.wait();
```

---

### View Functions

#### `getEscrow`

Get escrow transaction details.

```solidity
function getEscrow(bytes32 escrowId) external view returns (
    address buyer,
    address seller,
    uint256 clearAmount,
    uint256 timeout,
    TransactionStatus status,
    bool callbackReceived
)
```

**Returns**:
- `buyer`: Buyer address
- `seller`: Seller address
- `clearAmount`: Decrypted amount (0 if not yet decrypted)
- `timeout`: Timeout timestamp
- `status`: Current transaction status (0-4)
- `callbackReceived`: Whether Gateway callback was received

**Example**:
```javascript
const escrowData = await escrowContract.getEscrow(escrowId);
console.log(`Status: ${escrowData.status}`);
console.log(`Amount: ${escrowData.clearAmount}`);
```

---

#### `getUserEscrowCount`

Get total number of escrows for a user.

```solidity
function getUserEscrowCount(address user) external view returns (uint256)
```

**Example**:
```javascript
const count = await escrowContract.getUserEscrowCount(userAddress);
```

---

#### `getUserEscrowId`

Get specific escrow ID for a user by index.

```solidity
function getUserEscrowId(address user, uint256 index) external view returns (bytes32)
```

**Example**:
```javascript
// Get all user escrows
const count = await escrowContract.getUserEscrowCount(userAddress);
for (let i = 0; i < count; i++) {
    const escrowId = await escrowContract.getUserEscrowId(userAddress, i);
    const details = await escrowContract.getEscrow(escrowId);
    console.log(details);
}
```

---

#### `isTimedOut`

Check if an escrow has reached its timeout.

```solidity
function isTimedOut(bytes32 escrowId) external view returns (bool)
```

**Example**:
```javascript
const timedOut = await escrowContract.isTimedOut(escrowId);
if (timedOut) {
    await escrowContract.triggerTimeout(escrowId);
}
```

---

### Admin Functions

#### `withdrawFees`

Withdraw collected platform fees (owner only).

```solidity
function withdrawFees(address to) external onlyOwner
```

**Parameters**:
- `to`: Recipient address for fees

**Example**:
```javascript
const tx = await escrowContract.withdrawFees(treasuryAddress);
await tx.wait();
```

---

#### `setPlatformFee`

Update platform fee percentage (owner only).

```solidity
function setPlatformFee(uint256 newFeePercent) external onlyOwner
```

**Parameters**:
- `newFeePercent`: New fee percentage (0-10)

**Example**:
```javascript
await escrowContract.setPlatformFee(3); // Set to 3%
```

---

## PrivacyPreservingMarket Contract

### Core Functions

#### `createListing`

Create a marketplace listing with obfuscated price.

```solidity
function createListing(
    externalEuint64 encryptedPrice,
    externalEuint64 encryptedQuantity,
    bytes calldata inputProof
) external returns (bytes32 listingId)
```

**Parameters**:
- `encryptedPrice`: Encrypted item price
- `encryptedQuantity`: Encrypted available quantity
- `inputProof`: ZK proof for encrypted inputs

**Returns**: `listingId` - Unique listing identifier

**Privacy Features**:
- Price is obfuscated with random noise
- Random multiplier applied for safe division
- Quantity remains encrypted on-chain

**Events**: Emits `ListingCreated`

**Example**:
```javascript
const price = await fhevm.encrypt(100); // 100 tokens
const quantity = await fhevm.encrypt(50); // 50 items
const proof = await fhevm.generateProof([price, quantity]);

const tx = await marketContract.createListing(price, quantity, proof);
const receipt = await tx.wait();
const listingId = receipt.events[0].args.listingId;
```

---

#### `placeOrder`

Place an order with privacy-preserving payment calculation.

```solidity
function placeOrder(
    bytes32 listingId,
    externalEuint64 encryptedQuantity,
    bytes calldata inputProof
) external payable returns (bytes32 orderId)
```

**Parameters**:
- `listingId`: The listing to purchase from
- `encryptedQuantity`: Encrypted quantity to buy
- `inputProof`: ZK proof

**Returns**: `orderId` - Unique order identifier

**Privacy Calculations**:
```
scaledPrice = obfuscatedPrice × multiplier
encryptedPayment = scaledPrice × quantity
```

**Events**: Emits `OrderPlaced`

**Example**:
```javascript
const quantity = await fhevm.encrypt(5); // Buy 5 items
const proof = await fhevm.generateProof([quantity]);

const tx = await marketContract.placeOrder(
    listingId,
    quantity,
    proof,
    { value: ethers.utils.parseEther("0.5") }
);
```

---

#### `requestOrderDecryption`

Request decryption to finalize order.

```solidity
function requestOrderDecryption(bytes32 orderId) external
```

**Parameters**:
- `orderId`: Order identifier

**Requirements**:
- Caller must be buyer or seller
- Order status must be `Pending`
- Before timeout

**Events**: Emits `DecryptionRequested`

---

#### `orderDecryptionCallback`

Gateway callback for order decryption. **Automatically called by Gateway**.

```solidity
function orderDecryptionCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Internal Process**:
1. Verify decryption proof
2. Decode payment and quantity
3. Apply privacy-preserving division: `truePayment = scaledPayment / multiplier`
4. Verify payment amount
5. Calculate platform fee
6. Transfer funds to seller
7. Update listing quantity

**Events**: Emits `OrderCompleted` or `OrderRefunded`

---

#### `triggerOrderTimeout`

Trigger timeout for expired orders.

```solidity
function triggerOrderTimeout(bytes32 orderId) external
```

**Example**:
```javascript
const tx = await marketContract.triggerOrderTimeout(orderId);
await tx.wait();
```

---

#### `cancelListing`

Cancel active listing (seller only).

```solidity
function cancelListing(bytes32 listingId) external
```

**Example**:
```javascript
const tx = await marketContract.cancelListing(listingId);
await tx.wait();
```

---

### View Functions

#### `getListing`

Get listing details.

```solidity
function getListing(bytes32 listingId) external view returns (
    address seller,
    bool active,
    uint256 listingTime,
    uint256 priceMultiplier
)
```

---

#### `getOrder`

Get order details.

```solidity
function getOrder(bytes32 orderId) external view returns (
    address buyer,
    OrderStatus status,
    uint256 timeout,
    bool callbackReceived
)
```

---

#### `getUserListingCount`

Get user's total listings.

```solidity
function getUserListingCount(address user) external view returns (uint256)
```

---

#### `getUserOrderCount`

Get user's total orders.

```solidity
function getUserOrderCount(address user) external view returns (uint256)
```

---

## Common Patterns

### Pattern 1: Create and Execute Escrow

```javascript
// Step 1: Encrypt values
const amount = await fhevm.encrypt(1000000);
const price = await fhevm.encrypt(5000);
const proof = await fhevm.generateProof([amount, price]);

// Step 2: Create escrow
const createTx = await escrowContract.createEscrow(
    sellerAddress,
    amount,
    price,
    proof,
    86400, // 24 hours
    { value: ethers.utils.parseEther("0.1") }
);
const receipt = await createTx.wait();
const escrowId = receipt.events[0].args.escrowId;

// Step 3: Request decryption
const decryptTx = await escrowContract.requestDecryption(escrowId);
await decryptTx.wait();

// Step 4: Wait for Gateway callback (automatic)
// Monitor EscrowCompleted event
escrowContract.on("EscrowCompleted", (id, amount) => {
    if (id === escrowId) {
        console.log(`Escrow completed with amount: ${amount}`);
    }
});
```

---

### Pattern 2: Marketplace Full Flow

```javascript
// Seller: Create listing
const listingTx = await marketContract.createListing(
    encryptedPrice,
    encryptedQuantity,
    proof
);
const listingReceipt = await listingTx.wait();
const listingId = listingReceipt.events[0].args.listingId;

// Buyer: Place order
const orderTx = await marketContract.placeOrder(
    listingId,
    encryptedQuantity,
    proof,
    { value: payment }
);
const orderReceipt = await orderTx.wait();
const orderId = orderReceipt.events[0].args.orderId;

// Request decryption
await marketContract.requestOrderDecryption(orderId);

// Listen for completion
marketContract.on("OrderCompleted", (id, finalPrice) => {
    console.log(`Order ${id} completed for ${finalPrice}`);
});
```

---

### Pattern 3: Timeout Monitoring

```javascript
async function monitorTimeouts(escrowIds) {
    for (const escrowId of escrowIds) {
        const timedOut = await escrowContract.isTimedOut(escrowId);
        const escrow = await escrowContract.getEscrow(escrowId);

        if (timedOut && (escrow.status === 0 || escrow.status === 1)) {
            console.log(`Triggering timeout for ${escrowId}`);
            await escrowContract.triggerTimeout(escrowId);
        }
    }
}

// Run every hour
setInterval(() => monitorTimeouts(myEscrows), 3600000);
```

---

## Error Handling

### Common Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Not authorized: owner only" | Non-owner calling admin function | Use owner account |
| "Escrow does not exist" | Invalid escrow ID | Verify escrow ID is correct |
| "Invalid timeout range" | Timeout outside MIN/MAX | Use 1 hour to 30 days |
| "Invalid seller address" | Zero address or same as buyer | Use valid, different address |
| "Escrow has timed out" | Trying to decrypt after timeout | Use triggerTimeout instead |
| "Callback not received" | Gateway hasn't responded | Wait or check Gateway status |
| "Insufficient payment" | Payment less than required | Send correct amount |

---

## Events Reference

### PrivateEscrowWithRefund Events

```solidity
event EscrowCreated(bytes32 indexed escrowId, address indexed buyer, address indexed seller, uint256 timeout);
event DecryptionRequested(bytes32 indexed escrowId, uint256 requestId);
event EscrowCompleted(bytes32 indexed escrowId, uint256 amount);
event EscrowRefunded(bytes32 indexed escrowId, string reason);
event EscrowCancelled(bytes32 indexed escrowId);
event TimeoutTriggered(bytes32 indexed escrowId);
event FeesWithdrawn(address indexed to, uint256 amount);
```

### PrivacyPreservingMarket Events

```solidity
event ListingCreated(bytes32 indexed listingId, address indexed seller);
event OrderPlaced(bytes32 indexed orderId, bytes32 indexed listingId, address indexed buyer);
event DecryptionRequested(bytes32 indexed orderId, uint256 requestId);
event OrderCompleted(bytes32 indexed orderId, uint256 finalPrice);
event OrderRefunded(bytes32 indexed orderId, string reason);
event ListingCancelled(bytes32 indexed listingId);
```

---

## Constants Reference

### PrivateEscrowWithRefund

```solidity
MIN_TIMEOUT = 1 hours
MAX_TIMEOUT = 30 days
DECRYPTION_TIMEOUT = 2 hours
OBFUSCATION_RANGE = 1000
```

### PrivacyPreservingMarket

```solidity
PRICE_MULTIPLIER_RANGE = 10000
OBFUSCATION_NOISE_MAX = 1000
ORDER_TIMEOUT = 1 hours
```

---

## Best Practices

1. **Always monitor events**: Listen for completion and refund events
2. **Handle timeouts**: Implement timeout monitoring for stuck transactions
3. **Validate inputs client-side**: Encrypt valid data before sending
4. **Check balances**: Ensure sufficient funds before transactions
5. **Use try-catch**: Wrap contract calls in error handling
6. **Test on testnet**: Always test with real encrypted values first
7. **Monitor Gateway**: Check Gateway uptime before requesting decryption

---

## Support

For issues or questions:
- Check event logs for transaction details
- Verify timeout hasn't passed
- Ensure Gateway is operational
- Review error messages carefully
- Test with small amounts first
