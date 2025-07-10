/**
 * Insurance Platform Type Definitions
 */

export enum ClaimStatus {
  Submitted = 0,
  UnderReview = 1,
  Approved = 2,
  Rejected = 3,
  Paid = 4,
}

export enum AccidentSeverity {
  Minor = 0,    // 0-25%
  Moderate = 1, // 26-50%
  Major = 2,    // 51-75%
  Severe = 3,   // 76-100%
}

export interface Policy {
  id: bigint;
  holder: `0x${string}`;
  age: number;
  drivingYears: number;
  vehicleValue: number;
  premium: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Claim {
  id: bigint;
  policyId: bigint;
  claimant: `0x${string}`;
  damageAmount: number;
  repairCost: number;
  approvedAmount?: number;
  status: ClaimStatus;
  severity: AccidentSeverity;
  documentHash: string;
  submittedAt: Date;
  processedAt?: Date;
  isConfidential: boolean;
}

export interface ClaimDetails {
  policyId: bigint;
  claimant: `0x${string}`;
  status: ClaimStatus;
  severity: AccidentSeverity;
  documentHash: string;
  submittedAt: bigint;
  processedAt: bigint;
  isConfidential: boolean;
}

export interface Transaction {
  hash: string;
  type: 'policy' | 'claim' | 'review' | 'payment';
  status: 'pending' | 'success' | 'failed';
  timestamp: Date;
  details: string;
  blockNumber?: number;
}

export interface PolicyFormData {
  age: number;
  drivingYears: number;
  vehicleValue: number;
  premium: number;
}

export interface ClaimFormData {
  policyId: number;
  damageAmount: number;
  repairCost: number;
  severity: AccidentSeverity;
  documentHash: string;
  isConfidential: boolean;
}

export interface ReviewFormData {
  claimId: number;
  assessedDamage: number;
  recommendedPayout: number;
  reviewNotes: string;
  newStatus: ClaimStatus;
}
