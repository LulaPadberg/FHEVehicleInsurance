// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateVehicleInsurance is SepoliaConfig {

    address public insuranceCompany;
    uint256 public nextPolicyId;
    uint256 public nextClaimId;

    enum ClaimStatus {
        Submitted,
        UnderReview,
        Approved,
        Rejected,
        Paid
    }

    enum AccidentSeverity {
        Minor,      // 0-25%
        Moderate,   // 26-50%
        Major,      // 51-75%
        Severe      // 76-100%
    }

    struct PolicyHolder {
        address holderAddress;
        euint32 encryptedAge;
        euint32 encryptedDrivingYears;
        euint32 encryptedVehicleValue;
        euint32 encryptedPremium;
        bool isActive;
        uint256 createdAt;
    }

    struct InsuranceClaim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        euint32 encryptedDamageAmount;
        euint32 encryptedRepairCost;
        euint32 encryptedApprovedAmount;
        ClaimStatus status;
        AccidentSeverity severity;
        string ipfsDocumentHash;
        uint256 submittedAt;
        uint256 processedAt;
        bool isConfidential;
    }

    struct ClaimReview {
        uint256 claimId;
        address reviewer;
        euint32 encryptedAssessedDamage;
        euint32 encryptedRecommendedPayout;
        string reviewNotes;
        uint256 reviewedAt;
    }

    mapping(uint256 => PolicyHolder) public policies;
    mapping(address => uint256[]) public holderPolicies;
    mapping(uint256 => InsuranceClaim) public claims;
    mapping(uint256 => ClaimReview) public claimReviews;
    mapping(address => uint256[]) public holderClaims;
    mapping(address => bool) public authorizedReviewers;

    event PolicyCreated(uint256 indexed policyId, address indexed holder);
    event ClaimSubmitted(uint256 indexed claimId, uint256 indexed policyId, address indexed claimant);
    event ClaimReviewed(uint256 indexed claimId, address indexed reviewer, ClaimStatus newStatus);
    event ClaimApproved(uint256 indexed claimId, uint256 approvedAmount);
    event ClaimPaid(uint256 indexed claimId, address indexed recipient);
    event ReviewerAuthorized(address indexed reviewer);
    event ReviewerRevoked(address indexed reviewer);

    modifier onlyInsuranceCompany() {
        require(msg.sender == insuranceCompany, "Not authorized insurance company");
        _;
    }

    modifier onlyPolicyHolder(uint256 _policyId) {
        require(policies[_policyId].holderAddress == msg.sender, "Not policy holder");
        require(policies[_policyId].isActive, "Policy not active");
        _;
    }

    modifier onlyAuthorizedReviewer() {
        require(authorizedReviewers[msg.sender] || msg.sender == insuranceCompany, "Not authorized reviewer");
        _;
    }

    modifier claimExists(uint256 _claimId) {
        require(claims[_claimId].claimId != 0, "Claim does not exist");
        _;
    }

    constructor() {
        insuranceCompany = msg.sender;
        nextPolicyId = 1;
        nextClaimId = 1;
    }

    function createPolicy(
        uint32 _age,
        uint32 _drivingYears,
        uint32 _vehicleValue,
        uint32 _premium
    ) external returns (uint256) {
        require(_age >= 18 && _age <= 100, "Invalid age");
        require(_drivingYears <= _age - 16, "Invalid driving years");
        require(_vehicleValue > 0, "Vehicle value must be positive");
        require(_premium > 0, "Premium must be positive");

        euint32 encryptedAge = FHE.asEuint32(_age);
        euint32 encryptedDrivingYears = FHE.asEuint32(_drivingYears);
        euint32 encryptedVehicleValue = FHE.asEuint32(_vehicleValue);
        euint32 encryptedPremium = FHE.asEuint32(_premium);

        uint256 policyId = nextPolicyId++;

        policies[policyId] = PolicyHolder({
            holderAddress: msg.sender,
            encryptedAge: encryptedAge,
            encryptedDrivingYears: encryptedDrivingYears,
            encryptedVehicleValue: encryptedVehicleValue,
            encryptedPremium: encryptedPremium,
            isActive: true,
            createdAt: block.timestamp
        });

        holderPolicies[msg.sender].push(policyId);

        FHE.allowThis(encryptedAge);
        FHE.allowThis(encryptedDrivingYears);
        FHE.allowThis(encryptedVehicleValue);
        FHE.allowThis(encryptedPremium);

        FHE.allow(encryptedAge, msg.sender);
        FHE.allow(encryptedDrivingYears, msg.sender);
        FHE.allow(encryptedVehicleValue, msg.sender);
        FHE.allow(encryptedPremium, msg.sender);

        emit PolicyCreated(policyId, msg.sender);
        return policyId;
    }

    function submitClaim(
        uint256 _policyId,
        uint32 _damageAmount,
        uint32 _repairCost,
        AccidentSeverity _severity,
        string memory _documentHash,
        bool _isConfidential
    ) external onlyPolicyHolder(_policyId) returns (uint256) {
        require(_damageAmount > 0, "Damage amount must be positive");
        require(_repairCost > 0, "Repair cost must be positive");
        require(bytes(_documentHash).length > 0, "Document hash required");

        euint32 encryptedDamageAmount = FHE.asEuint32(_damageAmount);
        euint32 encryptedRepairCost = FHE.asEuint32(_repairCost);
        euint32 encryptedApprovedAmount = FHE.asEuint32(0);

        uint256 claimId = nextClaimId++;

        claims[claimId] = InsuranceClaim({
            claimId: claimId,
            policyId: _policyId,
            claimant: msg.sender,
            encryptedDamageAmount: encryptedDamageAmount,
            encryptedRepairCost: encryptedRepairCost,
            encryptedApprovedAmount: encryptedApprovedAmount,
            status: ClaimStatus.Submitted,
            severity: _severity,
            ipfsDocumentHash: _documentHash,
            submittedAt: block.timestamp,
            processedAt: 0,
            isConfidential: _isConfidential
        });

        holderClaims[msg.sender].push(claimId);

        FHE.allowThis(encryptedDamageAmount);
        FHE.allowThis(encryptedRepairCost);
        FHE.allowThis(encryptedApprovedAmount);

        FHE.allow(encryptedDamageAmount, msg.sender);
        FHE.allow(encryptedRepairCost, msg.sender);
        FHE.allow(encryptedApprovedAmount, msg.sender);
        FHE.allow(encryptedDamageAmount, insuranceCompany);
        FHE.allow(encryptedRepairCost, insuranceCompany);
        FHE.allow(encryptedApprovedAmount, insuranceCompany);

        emit ClaimSubmitted(claimId, _policyId, msg.sender);
        return claimId;
    }

    function reviewClaim(
        uint256 _claimId,
        uint32 _assessedDamage,
        uint32 _recommendedPayout,
        string memory _reviewNotes,
        ClaimStatus _newStatus
    ) external onlyAuthorizedReviewer claimExists(_claimId) {
        require(claims[_claimId].status == ClaimStatus.Submitted ||
                claims[_claimId].status == ClaimStatus.UnderReview, "Invalid claim status");
        require(_newStatus != ClaimStatus.Submitted, "Cannot revert to submitted");
        require(_assessedDamage > 0, "Assessed damage must be positive");

        euint32 encryptedAssessedDamage = FHE.asEuint32(_assessedDamage);
        euint32 encryptedRecommendedPayout = FHE.asEuint32(_recommendedPayout);

        claimReviews[_claimId] = ClaimReview({
            claimId: _claimId,
            reviewer: msg.sender,
            encryptedAssessedDamage: encryptedAssessedDamage,
            encryptedRecommendedPayout: encryptedRecommendedPayout,
            reviewNotes: _reviewNotes,
            reviewedAt: block.timestamp
        });

        claims[_claimId].status = _newStatus;
        claims[_claimId].processedAt = block.timestamp;

        if (_newStatus == ClaimStatus.Approved) {
            claims[_claimId].encryptedApprovedAmount = encryptedRecommendedPayout;
            FHE.allowThis(claims[_claimId].encryptedApprovedAmount);
            FHE.allow(claims[_claimId].encryptedApprovedAmount, claims[_claimId].claimant);
            FHE.allow(claims[_claimId].encryptedApprovedAmount, insuranceCompany);

            emit ClaimApproved(_claimId, _recommendedPayout);
        }

        FHE.allowThis(encryptedAssessedDamage);
        FHE.allowThis(encryptedRecommendedPayout);
        FHE.allow(encryptedAssessedDamage, insuranceCompany);
        FHE.allow(encryptedRecommendedPayout, insuranceCompany);

        emit ClaimReviewed(_claimId, msg.sender, _newStatus);
    }

    function processPayment(uint256 _claimId) external onlyInsuranceCompany claimExists(_claimId) {
        require(claims[_claimId].status == ClaimStatus.Approved, "Claim not approved");

        claims[_claimId].status = ClaimStatus.Paid;
        claims[_claimId].processedAt = block.timestamp;

        emit ClaimPaid(_claimId, claims[_claimId].claimant);
    }

    function calculateRiskScore(uint256 _policyId) external returns (bytes32) {
        require(policies[_policyId].isActive, "Policy not active");

        PolicyHolder storage policy = policies[_policyId];

        euint32 ageWeight = FHE.mul(policy.encryptedAge, FHE.asEuint32(3));
        euint32 experienceBonus = FHE.mul(policy.encryptedDrivingYears, FHE.asEuint32(2));
        euint32 valueWeight = FHE.mul(policy.encryptedVehicleValue, FHE.asEuint32(1));

        euint32 riskBase = FHE.add(ageWeight, valueWeight);
        euint32 totalRisk = FHE.sub(riskBase, experienceBonus);

        return FHE.toBytes32(totalRisk);
    }

    function authorizeReviewer(address _reviewer) external onlyInsuranceCompany {
        require(_reviewer != address(0), "Invalid reviewer address");
        require(!authorizedReviewers[_reviewer], "Reviewer already authorized");

        authorizedReviewers[_reviewer] = true;
        emit ReviewerAuthorized(_reviewer);
    }

    function revokeReviewer(address _reviewer) external onlyInsuranceCompany {
        require(authorizedReviewers[_reviewer], "Reviewer not authorized");

        authorizedReviewers[_reviewer] = false;
        emit ReviewerRevoked(_reviewer);
    }

    function getClaimsByHolder(address _holder) external view returns (uint256[] memory) {
        return holderClaims[_holder];
    }

    function getPoliciesByHolder(address _holder) external view returns (uint256[] memory) {
        return holderPolicies[_holder];
    }

    function getClaimStatus(uint256 _claimId) external view returns (ClaimStatus) {
        return claims[_claimId].status;
    }

    function getClaimDetails(uint256 _claimId) external view claimExists(_claimId) returns (
        uint256 policyId,
        address claimant,
        ClaimStatus status,
        AccidentSeverity severity,
        string memory documentHash,
        uint256 submittedAt,
        uint256 processedAt,
        bool isConfidential
    ) {
        InsuranceClaim storage claim = claims[_claimId];

        require(
            msg.sender == claim.claimant ||
            msg.sender == insuranceCompany ||
            authorizedReviewers[msg.sender],
            "Not authorized to view claim details"
        );

        return (
            claim.policyId,
            claim.claimant,
            claim.status,
            claim.severity,
            claim.ipfsDocumentHash,
            claim.submittedAt,
            claim.processedAt,
            claim.isConfidential
        );
    }

    function emergencyPause() external onlyInsuranceCompany {
    }

    function updateInsuranceCompany(address _newCompany) external onlyInsuranceCompany {
        require(_newCompany != address(0), "Invalid company address");
        insuranceCompany = _newCompany;
    }
}