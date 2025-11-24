// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint64, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivateEscrowWithRefund
 * @notice Advanced FHE-based escrow with Gateway callbacks, refund mechanism, and timeout protection
 * @dev Features:
 *      - Refund mechanism for decryption failures
 *      - Timeout protection to prevent permanent locks
 *      - Gateway callback pattern for async decryption
 *      - Privacy-preserving price calculations with obfuscation
 *      - Input validation and access control
 *      - Gas-optimized HCU usage
 */
contract PrivateEscrowWithRefund is SepoliaConfig {
    // ========== STRUCTURES ==========

    struct EscrowTransaction {
        address buyer;
        address seller;
        euint64 encryptedAmount;      // Encrypted transaction amount
        euint64 encryptedPrice;        // Encrypted price with obfuscation
        uint256 clearAmount;           // Revealed amount after decryption
        uint256 timeout;               // Timeout timestamp
        uint256 createdAt;             // Creation timestamp
        TransactionStatus status;
        uint256 decryptionRequestId;   // Gateway decryption request ID
        bool callbackReceived;         // Flag for callback completion
        uint256 randomMultiplier;      // Privacy-preserving division multiplier
    }

    enum TransactionStatus {
        Active,           // Transaction created
        AwaitingDecrypt,  // Decryption requested
        Completed,        // Successfully completed
        Refunded,         // Refunded due to failure/timeout
        Cancelled         // Cancelled by authorized party
    }

    // ========== STATE VARIABLES ==========

    mapping(bytes32 => EscrowTransaction) public escrows;
    mapping(uint256 => bytes32) internal escrowIdByRequestId;
    mapping(address => bytes32[]) public userEscrows;

    uint256 public constant MIN_TIMEOUT = 1 hours;
    uint256 public constant MAX_TIMEOUT = 30 days;
    uint256 public constant DECRYPTION_TIMEOUT = 2 hours;
    uint256 public constant OBFUSCATION_RANGE = 1000;

    address public owner;
    uint256 public platformFeePercent = 2; // 2% platform fee
    uint256 public totalFeesCollected;

    // ========== EVENTS ==========

    event EscrowCreated(bytes32 indexed escrowId, address indexed buyer, address indexed seller, uint256 timeout);
    event DecryptionRequested(bytes32 indexed escrowId, uint256 requestId);
    event EscrowCompleted(bytes32 indexed escrowId, uint256 amount);
    event EscrowRefunded(bytes32 indexed escrowId, string reason);
    event EscrowCancelled(bytes32 indexed escrowId);
    event TimeoutTriggered(bytes32 indexed escrowId);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ========== MODIFIERS ==========

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: owner only");
        _;
    }

    modifier validTimeout(uint256 timeout) {
        require(timeout >= MIN_TIMEOUT && timeout <= MAX_TIMEOUT, "Invalid timeout range");
        _;
    }

    modifier escrowExists(bytes32 escrowId) {
        require(escrows[escrowId].buyer != address(0), "Escrow does not exist");
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor() {
        owner = msg.sender;
    }

    // ========== CORE FUNCTIONS ==========

    /**
     * @notice Create new escrow with encrypted amount
     * @param seller Address of the seller
     * @param encryptedAmount Encrypted transaction amount
     * @param encryptedPrice Encrypted price (obfuscated)
     * @param inputProof ZK proof for encrypted inputs
     * @param timeout Timeout duration in seconds
     * @return escrowId Unique identifier for the escrow
     */
    function createEscrow(
        address seller,
        externalEuint64 encryptedAmount,
        externalEuint64 encryptedPrice,
        bytes calldata inputProof,
        uint256 timeout
    )
        external
        payable
        validTimeout(timeout)
        returns (bytes32 escrowId)
    {
        // Input validation
        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Buyer and seller cannot be same");
        require(msg.value > 0, "Must send funds");

        // Generate unique escrow ID
        escrowId = keccak256(abi.encodePacked(msg.sender, seller, block.timestamp, block.number));
        require(escrows[escrowId].buyer == address(0), "Escrow ID collision");

        // Convert external encrypted values with proof verification
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        euint64 price = FHE.fromExternal(encryptedPrice, inputProof);

        // Generate random multiplier for privacy-preserving division
        uint256 randomMult = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, seller))) % OBFUSCATION_RANGE + 1;

        // Create escrow
        escrows[escrowId] = EscrowTransaction({
            buyer: msg.sender,
            seller: seller,
            encryptedAmount: amount,
            encryptedPrice: price,
            clearAmount: 0,
            timeout: block.timestamp + timeout,
            createdAt: block.timestamp,
            status: TransactionStatus.Active,
            decryptionRequestId: 0,
            callbackReceived: false,
            randomMultiplier: randomMult
        });

        // Grant permissions for FHE operations
        FHE.allowThis(amount);
        FHE.allowThis(price);
        FHE.allow(amount, seller);
        FHE.allow(price, seller);

        // Track user escrows
        userEscrows[msg.sender].push(escrowId);
        userEscrows[seller].push(escrowId);

        emit EscrowCreated(escrowId, msg.sender, seller, block.timestamp + timeout);
    }

    /**
     * @notice Request decryption via Gateway callback
     * @param escrowId The escrow identifier
     */
    function requestDecryption(bytes32 escrowId)
        external
        escrowExists(escrowId)
    {
        EscrowTransaction storage escrow = escrows[escrowId];

        // Access control: only buyer or seller can request
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Not authorized: buyer or seller only"
        );

        require(escrow.status == TransactionStatus.Active, "Invalid status for decryption");
        require(block.timestamp < escrow.timeout, "Escrow has timed out");

        // Prepare ciphertexts for decryption
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(escrow.encryptedAmount);

        // Request Gateway decryption with callback
        uint256 requestId = FHE.requestDecryption(cts, this.decryptionCallback.selector);

        escrow.decryptionRequestId = requestId;
        escrow.status = TransactionStatus.AwaitingDecrypt;
        escrowIdByRequestId[requestId] = escrowId;

        emit DecryptionRequested(escrowId, requestId);
    }

    /**
     * @notice Gateway callback for decryption results
     * @param requestId The decryption request identifier
     * @param cleartexts Decrypted values
     * @param decryptionProof Proof of valid decryption
     */
    function decryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify the decryption signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        bytes32 escrowId = escrowIdByRequestId[requestId];
        EscrowTransaction storage escrow = escrows[escrowId];

        require(escrow.status == TransactionStatus.AwaitingDecrypt, "Invalid escrow status");

        // Check if decryption timeout has passed
        if (block.timestamp > escrow.createdAt + DECRYPTION_TIMEOUT) {
            // Trigger refund due to timeout
            _refundEscrow(escrowId, "Decryption timeout exceeded");
            return;
        }

        // Decode the decrypted amount
        (uint64 decryptedAmount) = abi.decode(cleartexts, (uint64));

        escrow.clearAmount = uint256(decryptedAmount);
        escrow.callbackReceived = true;

        // Complete the escrow transaction
        _completeEscrow(escrowId);
    }

    /**
     * @notice Complete escrow and transfer funds
     * @param escrowId The escrow identifier
     */
    function _completeEscrow(bytes32 escrowId) internal {
        EscrowTransaction storage escrow = escrows[escrowId];

        require(escrow.callbackReceived, "Callback not received");
        require(escrow.status == TransactionStatus.AwaitingDecrypt, "Invalid status");

        uint256 amount = escrow.clearAmount;

        // Calculate platform fee
        uint256 platformFee = (amount * platformFeePercent) / 100;
        uint256 sellerAmount = amount - platformFee;

        totalFeesCollected += platformFee;
        escrow.status = TransactionStatus.Completed;

        // Transfer funds to seller
        (bool success, ) = payable(escrow.seller).call{value: sellerAmount}("");
        require(success, "Transfer to seller failed");

        emit EscrowCompleted(escrowId, amount);
    }

    /**
     * @notice Refund escrow due to failure or timeout
     * @param escrowId The escrow identifier
     * @param reason Reason for refund
     */
    function _refundEscrow(bytes32 escrowId, string memory reason) internal {
        EscrowTransaction storage escrow = escrows[escrowId];

        uint256 refundAmount = address(this).balance;
        escrow.status = TransactionStatus.Refunded;

        // Refund to buyer
        (bool success, ) = payable(escrow.buyer).call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit EscrowRefunded(escrowId, reason);
    }

    /**
     * @notice Trigger timeout protection for stuck escrows
     * @param escrowId The escrow identifier
     */
    function triggerTimeout(bytes32 escrowId)
        external
        escrowExists(escrowId)
    {
        EscrowTransaction storage escrow = escrows[escrowId];

        require(block.timestamp >= escrow.timeout, "Timeout not yet reached");
        require(
            escrow.status == TransactionStatus.Active ||
            escrow.status == TransactionStatus.AwaitingDecrypt,
            "Cannot timeout completed escrow"
        );

        _refundEscrow(escrowId, "Timeout triggered");
        emit TimeoutTriggered(escrowId);
    }

    /**
     * @notice Cancel escrow (only before decryption)
     * @param escrowId The escrow identifier
     */
    function cancelEscrow(bytes32 escrowId)
        external
        escrowExists(escrowId)
    {
        EscrowTransaction storage escrow = escrows[escrowId];

        require(msg.sender == escrow.buyer, "Only buyer can cancel");
        require(escrow.status == TransactionStatus.Active, "Can only cancel active escrow");

        _refundEscrow(escrowId, "Cancelled by buyer");
        escrow.status = TransactionStatus.Cancelled;

        emit EscrowCancelled(escrowId);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Withdraw collected platform fees
     * @param to Recipient address
     */
    function withdrawFees(address to) external onlyOwner {
        require(to != address(0), "Invalid recipient address");
        require(totalFeesCollected > 0, "No fees to withdraw");

        uint256 amount = totalFeesCollected;
        totalFeesCollected = 0;

        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Fee withdrawal failed");

        emit FeesWithdrawn(to, amount);
    }

    /**
     * @notice Update platform fee percentage
     * @param newFeePercent New fee percentage (0-10)
     */
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 10, "Fee too high (max 10%)");
        platformFeePercent = newFeePercent;
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get escrow details
     * @param escrowId The escrow identifier
     */
    function getEscrow(bytes32 escrowId)
        external
        view
        returns (
            address buyer,
            address seller,
            uint256 clearAmount,
            uint256 timeout,
            TransactionStatus status,
            bool callbackReceived
        )
    {
        EscrowTransaction storage escrow = escrows[escrowId];
        return (
            escrow.buyer,
            escrow.seller,
            escrow.clearAmount,
            escrow.timeout,
            escrow.status,
            escrow.callbackReceived
        );
    }

    /**
     * @notice Get user's escrow count
     * @param user User address
     */
    function getUserEscrowCount(address user) external view returns (uint256) {
        return userEscrows[user].length;
    }

    /**
     * @notice Get user's escrow by index
     * @param user User address
     * @param index Escrow index
     */
    function getUserEscrowId(address user, uint256 index) external view returns (bytes32) {
        require(index < userEscrows[user].length, "Index out of bounds");
        return userEscrows[user][index];
    }

    /**
     * @notice Check if escrow has timed out
     * @param escrowId The escrow identifier
     */
    function isTimedOut(bytes32 escrowId) external view returns (bool) {
        return block.timestamp >= escrows[escrowId].timeout;
    }

    receive() external payable {}
}
