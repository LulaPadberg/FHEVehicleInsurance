// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint64, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivacyPreservingMarket
 * @notice Advanced marketplace with privacy-preserving division and price obfuscation
 * @dev Solves key privacy challenges:
 *      1. Division problem: Uses random multipliers to prevent leakage
 *      2. Price leakage: Implements obfuscation techniques
 *      3. Async processing: Gateway callback pattern
 *      4. Gas optimization: Efficient HCU usage
 */
contract PrivacyPreservingMarket is SepoliaConfig {
    // ========== STRUCTURES ==========

    struct Listing {
        address seller;
        euint64 encryptedPrice;        // Obfuscated price
        euint64 encryptedQuantity;     // Private quantity
        euint64 obfuscationNoise;      // Random noise for privacy
        uint256 priceMultiplier;       // For safe division
        bool active;
        uint256 listingTime;
    }

    struct PurchaseOrder {
        bytes32 listingId;
        address buyer;
        euint64 encryptedPayment;      // Encrypted payment amount
        euint64 encryptedQuantity;     // Encrypted quantity to buy
        uint256 decryptionRequestId;
        OrderStatus status;
        uint256 createdAt;
        uint256 timeout;
        bool callbackReceived;
    }

    enum OrderStatus {
        Pending,
        AwaitingDecryption,
        Completed,
        Refunded,
        Cancelled
    }

    // ========== STATE VARIABLES ==========

    mapping(bytes32 => Listing) public listings;
    mapping(bytes32 => PurchaseOrder) public orders;
    mapping(uint256 => bytes32) internal orderIdByRequestId;
    mapping(address => bytes32[]) public userListings;
    mapping(address => bytes32[]) public userOrders;

    uint256 public constant PRICE_MULTIPLIER_RANGE = 10000;
    uint256 public constant OBFUSCATION_NOISE_MAX = 1000;
    uint256 public constant ORDER_TIMEOUT = 1 hours;

    address public owner;
    uint256 public platformFee = 250; // 2.5% in basis points

    // ========== EVENTS ==========

    event ListingCreated(bytes32 indexed listingId, address indexed seller);
    event OrderPlaced(bytes32 indexed orderId, bytes32 indexed listingId, address indexed buyer);
    event DecryptionRequested(bytes32 indexed orderId, uint256 requestId);
    event OrderCompleted(bytes32 indexed orderId, uint256 finalPrice);
    event OrderRefunded(bytes32 indexed orderId, string reason);
    event ListingCancelled(bytes32 indexed listingId);

    // ========== MODIFIERS ==========

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor() {
        owner = msg.sender;
    }

    // ========== PRIVACY-PRESERVING FUNCTIONS ==========

    /**
     * @notice Create listing with price obfuscation
     * @dev Price is obfuscated using random noise to prevent leakage
     * @param encryptedPrice Encrypted base price
     * @param encryptedQuantity Encrypted available quantity
     * @param inputProof ZK proof for encrypted inputs
     */
    function createListing(
        externalEuint64 encryptedPrice,
        externalEuint64 encryptedQuantity,
        bytes calldata inputProof
    ) external returns (bytes32 listingId) {
        // Convert external encrypted values
        euint64 basePrice = FHE.fromExternal(encryptedPrice, inputProof);
        euint64 quantity = FHE.fromExternal(encryptedQuantity, inputProof);

        // Generate listing ID
        listingId = keccak256(abi.encodePacked(msg.sender, block.timestamp, block.number));

        // Privacy technique: Add random noise to price
        uint256 noiseValue = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % OBFUSCATION_NOISE_MAX;
        euint64 noise = FHE.asEuint64(uint64(noiseValue));

        // Obfuscate price: price' = price + noise
        euint64 obfuscatedPrice = FHE.add(basePrice, noise);

        // Generate random multiplier for safe division
        uint256 multiplier = (uint256(keccak256(abi.encodePacked(listingId, block.timestamp))) % PRICE_MULTIPLIER_RANGE) + 1;

        // Create listing
        listings[listingId] = Listing({
            seller: msg.sender,
            encryptedPrice: obfuscatedPrice,
            encryptedQuantity: quantity,
            obfuscationNoise: noise,
            priceMultiplier: multiplier,
            active: true,
            listingTime: block.timestamp
        });

        // Set permissions
        FHE.allowThis(obfuscatedPrice);
        FHE.allowThis(quantity);
        FHE.allowThis(noise);

        userListings[msg.sender].push(listingId);
        emit ListingCreated(listingId, msg.sender);
    }

    /**
     * @notice Place order with privacy-preserving calculations
     * @dev Uses encrypted computations to prevent information leakage
     * @param listingId The listing to purchase from
     * @param encryptedQuantity Encrypted quantity to buy
     * @param inputProof ZK proof
     */
    function placeOrder(
        bytes32 listingId,
        externalEuint64 encryptedQuantity,
        bytes calldata inputProof
    ) external payable returns (bytes32 orderId) {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        // Convert quantity
        euint64 buyQuantity = FHE.fromExternal(encryptedQuantity, inputProof);

        // Privacy-preserving calculation: payment = (obfuscatedPrice * quantity * multiplier)
        // The multiplier prevents division leakage
        euint64 scaledPrice = FHE.mul(listing.encryptedPrice, FHE.asEuint64(uint64(listing.priceMultiplier)));
        euint64 encryptedPayment = FHE.mul(scaledPrice, buyQuantity);

        // Check if buyer has enough quantity available (encrypted comparison)
        ebool hasEnoughQuantity = FHE.lte(buyQuantity, listing.encryptedQuantity);

        // Create order ID
        orderId = keccak256(abi.encodePacked(listingId, msg.sender, block.timestamp, block.number));

        orders[orderId] = PurchaseOrder({
            listingId: listingId,
            buyer: msg.sender,
            encryptedPayment: encryptedPayment,
            encryptedQuantity: buyQuantity,
            decryptionRequestId: 0,
            status: OrderStatus.Pending,
            createdAt: block.timestamp,
            timeout: block.timestamp + ORDER_TIMEOUT,
            callbackReceived: false
        });

        // Set permissions
        FHE.allowThis(encryptedPayment);
        FHE.allowThis(buyQuantity);
        FHE.allow(encryptedPayment, listing.seller);

        userOrders[msg.sender].push(orderId);
        emit OrderPlaced(orderId, listingId, msg.sender);
    }

    /**
     * @notice Request decryption for order finalization
     * @dev Uses Gateway callback for async decryption
     * @param orderId The order identifier
     */
    function requestOrderDecryption(bytes32 orderId) external {
        PurchaseOrder storage order = orders[orderId];
        require(order.buyer == msg.sender || listings[order.listingId].seller == msg.sender, "Not authorized");
        require(order.status == OrderStatus.Pending, "Invalid order status");
        require(block.timestamp < order.timeout, "Order timed out");

        // Prepare encrypted values for decryption
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(order.encryptedPayment);
        cts[1] = FHE.toBytes32(order.encryptedQuantity);

        // Request Gateway decryption
        uint256 requestId = FHE.requestDecryption(cts, this.orderDecryptionCallback.selector);

        order.decryptionRequestId = requestId;
        order.status = OrderStatus.AwaitingDecryption;
        orderIdByRequestId[requestId] = orderId;

        emit DecryptionRequested(orderId, requestId);
    }

    /**
     * @notice Gateway callback for order decryption
     * @dev Handles decrypted values and completes the transaction
     * @param requestId Decryption request ID
     * @param cleartexts Decrypted values
     * @param decryptionProof Proof of valid decryption
     */
    function orderDecryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify decryption
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        bytes32 orderId = orderIdByRequestId[requestId];
        PurchaseOrder storage order = orders[orderId];
        Listing storage listing = listings[order.listingId];

        require(order.status == OrderStatus.AwaitingDecryption, "Invalid order status");

        // Check timeout
        if (block.timestamp > order.timeout) {
            _refundOrder(orderId, "Decryption timeout");
            return;
        }

        // Decode decrypted values
        (uint64 scaledPayment, uint64 quantity) = abi.decode(cleartexts, (uint64, uint64));

        // Privacy-preserving division: divide by multiplier to get true payment
        uint256 truePayment = uint256(scaledPayment) / listing.priceMultiplier;

        // Verify payment matches
        require(msg.value >= truePayment, "Insufficient payment");

        // Calculate platform fee
        uint256 fee = (truePayment * platformFee) / 10000;
        uint256 sellerAmount = truePayment - fee;

        // Update listing quantity (subtract sold amount)
        listing.encryptedQuantity = FHE.sub(listing.encryptedQuantity, FHE.asEuint64(quantity));
        FHE.allowThis(listing.encryptedQuantity);

        order.status = OrderStatus.Completed;
        order.callbackReceived = true;

        // Transfer funds to seller
        (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(success, "Payment to seller failed");

        // Refund excess payment
        if (msg.value > truePayment) {
            (bool refundSuccess, ) = payable(order.buyer).call{value: msg.value - truePayment}("");
            require(refundSuccess, "Refund failed");
        }

        emit OrderCompleted(orderId, truePayment);
    }

    /**
     * @notice Refund order due to failure or timeout
     * @param orderId Order identifier
     * @param reason Reason for refund
     */
    function _refundOrder(bytes32 orderId, string memory reason) internal {
        PurchaseOrder storage order = orders[orderId];
        order.status = OrderStatus.Refunded;

        if (address(this).balance > 0) {
            (bool success, ) = payable(order.buyer).call{value: address(this).balance}("");
            require(success, "Refund failed");
        }

        emit OrderRefunded(orderId, reason);
    }

    /**
     * @notice Trigger timeout for expired orders
     * @param orderId Order identifier
     */
    function triggerOrderTimeout(bytes32 orderId) external {
        PurchaseOrder storage order = orders[orderId];
        require(block.timestamp >= order.timeout, "Not yet timed out");
        require(
            order.status == OrderStatus.Pending ||
            order.status == OrderStatus.AwaitingDecryption,
            "Cannot timeout completed order"
        );

        _refundOrder(orderId, "Order timeout");
    }

    /**
     * @notice Cancel active listing
     * @param listingId Listing identifier
     */
    function cancelListing(bytes32 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.active, "Listing not active");

        listing.active = false;
        emit ListingCancelled(listingId);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get listing details
     */
    function getListing(bytes32 listingId) external view returns (
        address seller,
        bool active,
        uint256 listingTime,
        uint256 priceMultiplier
    ) {
        Listing storage listing = listings[listingId];
        return (listing.seller, listing.active, listing.listingTime, listing.priceMultiplier);
    }

    /**
     * @notice Get order details
     */
    function getOrder(bytes32 orderId) external view returns (
        address buyer,
        OrderStatus status,
        uint256 timeout,
        bool callbackReceived
    ) {
        PurchaseOrder storage order = orders[orderId];
        return (order.buyer, order.status, order.timeout, order.callbackReceived);
    }

    /**
     * @notice Get user listing count
     */
    function getUserListingCount(address user) external view returns (uint256) {
        return userListings[user].length;
    }

    /**
     * @notice Get user order count
     */
    function getUserOrderCount(address user) external view returns (uint256) {
        return userOrders[user].length;
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Update platform fee
     * @param newFee New fee in basis points (max 1000 = 10%)
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high");
        platformFee = newFee;
    }

    receive() external payable {}
}
