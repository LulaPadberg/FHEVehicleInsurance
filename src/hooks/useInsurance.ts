'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { useToast } from '@/hooks/useToast';

export function useCreatePolicy() {
  const { toast } = useToast();
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPolicy = async (data: {
    age: number;
    drivingYears: number;
    vehicleValue: number;
    premium: number;
  }) => {
    try {
      await writeContract({
        address: CONTRACTS.INSURANCE.address,
        abi: CONTRACTS.INSURANCE.abi,
        functionName: 'createPolicy',
        args: [
          BigInt(data.age),
          BigInt(data.drivingYears),
          BigInt(data.vehicleValue),
          BigInt(data.premium),
        ],
      });

      toast({
        title: 'Policy Creation Submitted',
        description: 'Waiting for blockchain confirmation...',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create policy',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Show success toast when confirmed
  if (isSuccess) {
    toast({
      title: 'Success',
      description: 'Policy created successfully!',
    });
  }

  return {
    createPolicy,
    isLoading: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useSubmitClaim() {
  const { toast } = useToast();
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const submitClaim = async (data: {
    policyId: bigint;
    damageAmount: number;
    repairCost: number;
    severity: number;
    documentHash: string;
    isConfidential: boolean;
  }) => {
    try {
      await writeContract({
        address: CONTRACTS.INSURANCE.address,
        abi: CONTRACTS.INSURANCE.abi,
        functionName: 'submitClaim',
        args: [
          data.policyId,
          BigInt(data.damageAmount),
          BigInt(data.repairCost),
          data.severity,
          data.documentHash,
          data.isConfidential,
        ],
      });

      toast({
        title: 'Claim Submitted',
        description: 'Waiting for blockchain confirmation...',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit claim',
        variant: 'destructive',
      });
      throw err;
    }
  };

  if (isSuccess) {
    toast({
      title: 'Success',
      description: 'Claim submitted successfully!',
    });
  }

  return {
    submitClaim,
    isLoading: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useGetPolicy(policyId: bigint | undefined) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACTS.INSURANCE.address,
    abi: CONTRACTS.INSURANCE.abi,
    functionName: 'getPolicy',
    args: policyId !== undefined ? [policyId] : undefined,
    query: {
      enabled: policyId !== undefined,
    },
  });

  return {
    policy: data,
    isLoading,
    isError,
    refetch,
  };
}

export function useGetClaim(claimId: bigint | undefined) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACTS.INSURANCE.address,
    abi: CONTRACTS.INSURANCE.abi,
    functionName: 'getClaim',
    args: claimId !== undefined ? [claimId] : undefined,
    query: {
      enabled: claimId !== undefined,
    },
  });

  return {
    claim: data,
    isLoading,
    isError,
    refetch,
  };
}
