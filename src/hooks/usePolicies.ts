'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import type { Address } from 'viem';

export function useUserPolicies(address: Address | undefined) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACTS.INSURANCE.address,
    abi: CONTRACTS.INSURANCE.abi,
    functionName: 'getUserPolicies',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    policies: data as bigint[] | undefined,
    isLoading,
    isError,
    refetch,
  };
}

export function usePolicyCount() {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACTS.INSURANCE.address,
    abi: CONTRACTS.INSURANCE.abi,
    functionName: 'getPolicyCount',
  });

  return {
    count: data as bigint | undefined,
    isLoading,
    isError,
  };
}
