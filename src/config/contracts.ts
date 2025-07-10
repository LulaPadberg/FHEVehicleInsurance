/**
 * Smart Contract Configuration
 * Updated: 2025-10-23
 */

export const CONTRACTS = {
  INSURANCE: {
    address: (process.env.NEXT_PUBLIC_INSURANCE_CONTRACT as `0x${string}`) || '0x07e59aEcC74578c859a89a4CD7cD40E760625890',
    abi: [
      'function createPolicy(uint32 _age, uint32 _drivingYears, uint32 _vehicleValue, uint32 _premium) external returns (uint256)',
      'function submitClaim(uint256 _policyId, uint32 _damageAmount, uint32 _repairCost, uint8 _severity, string memory _documentHash, bool _isConfidential) external returns (uint256)',
      'function reviewClaim(uint256 _claimId, uint32 _assessedDamage, uint32 _recommendedPayout, string memory _reviewNotes, uint8 _newStatus) external',
      'function getClaimsByHolder(address _holder) external view returns (uint256[] memory)',
      'function getPoliciesByHolder(address _holder) external view returns (uint256[] memory)',
      'function getClaimStatus(uint256 _claimId) external view returns (uint8)',
      'function getClaimDetails(uint256 _claimId) external view returns (uint256, address, uint8, uint8, string memory, uint256, uint256, bool)',
      'function authorizeReviewer(address _reviewer) external',
      'function processPayment(uint256 _claimId) external',
      'function insuranceCompany() external view returns (address)',
      'function nextPolicyId() external view returns (uint256)',
      'function nextClaimId() external view returns (uint256)',
      'function isPaused() external view returns (bool)',
      'event PolicyCreated(uint256 indexed policyId, address indexed holder)',
      'event ClaimSubmitted(uint256 indexed claimId, uint256 indexed policyId, address indexed claimant)',
      'event ClaimReviewed(uint256 indexed claimId, address indexed reviewer, uint8 newStatus)',
      'event ClaimApproved(uint256 indexed claimId, uint256 approvedAmount)',
      'event ClaimPaid(uint256 indexed claimId, address indexed recipient)',
    ] as const,
  },
  PAUSERSET: {
    address: (process.env.NEXT_PUBLIC_PAUSERSET_CONTRACT as `0x${string}`) || '0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D',
    abi: [
      'function pause() external',
      'function unpause() external',
    ] as const,
  },
} as const;

export const CHAIN_CONFIG = {
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      decimals: 18,
      name: 'Sepolia ETH',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['https://sepolia.infura.io/v3/'],
      },
      public: {
        http: ['https://sepolia.infura.io/v3/'],
      },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
    testnet: true,
  },
} as const;
