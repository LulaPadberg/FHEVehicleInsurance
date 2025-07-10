import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Ethereum address to short version
 */
export function formatAddress(address: string | undefined): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format number to USD currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format transaction hash
 */
export function formatTxHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * Get Etherscan link for transaction
 */
export function getEtherscanLink(hash: string, type: 'tx' | 'address' = 'tx'): string {
  const baseUrl = 'https://sepolia.etherscan.io';
  return `${baseUrl}/${type}/${hash}`;
}

/**
 * Validate policy form data
 */
export function validatePolicyData(data: {
  age: number;
  drivingYears: number;
  vehicleValue: number;
  premium: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.age < 18 || data.age > 100) {
    errors.push('Age must be between 18 and 100');
  }

  if (data.drivingYears > data.age - 16) {
    errors.push(`Driving years cannot exceed ${data.age - 16}`);
  }

  if (data.vehicleValue <= 0) {
    errors.push('Vehicle value must be greater than 0');
  }

  if (data.premium <= 0) {
    errors.push('Premium must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate claim form data
 */
export function validateClaimData(data: {
  policyId: number;
  damageAmount: number;
  repairCost: number;
  documentHash: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.policyId || data.policyId <= 0) {
    errors.push('Invalid policy ID');
  }

  if (data.damageAmount <= 0) {
    errors.push('Damage amount must be greater than 0');
  }

  if (data.repairCost <= 0) {
    errors.push('Repair cost must be greater than 0');
  }

  if (!data.documentHash || data.documentHash.trim() === '') {
    errors.push('Document hash is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get severity label
 */
export function getSeverityLabel(severity: number): string {
  const labels = ['Minor', 'Moderate', 'Major', 'Severe'];
  return labels[severity] || 'Unknown';
}

/**
 * Get status label
 */
export function getStatusLabel(status: number): string {
  const labels = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'];
  return labels[status] || 'Unknown';
}

/**
 * Get status color
 */
export function getStatusColor(status: number): string {
  const colors = {
    0: 'bg-blue-100 text-blue-800',
    1: 'bg-yellow-100 text-yellow-800',
    2: 'bg-green-100 text-green-800',
    3: 'bg-red-100 text-red-800',
    4: 'bg-purple-100 text-purple-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}
