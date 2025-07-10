'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';

export function usePolicyClaims(policyId: bigint | undefined) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACTS.INSURANCE.address,
    abi: CONTRACTS.INSURANCE.abi,
    functionName: 'getPolicyClaims',
    args: policyId !== undefined ? [policyId] : undefined,
    query: {
      enabled: policyId !== undefined,
    },
  });

  return {
    claims: data as bigint[] | undefined,
    isLoading,
    isError,
    refetch,
  };
}

export function useClaimCount() {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACTS.INSURANCE.address,
    abi: CONTRACTS.INSURANCE.abi,
    functionName: 'getClaimCount',
  });

  return {
    count: data as bigint | undefined,
    isLoading,
    isError,
  };
}
