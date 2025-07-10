'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import type { Address } from 'viem';

export interface Transaction {
  hash: string;
  blockNumber: bigint;
  timestamp: number;
  from: Address;
  to: Address;
  functionName: string;
  status: 'success' | 'failed' | 'pending';
}

export function useTransactions() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || !publicClient) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get the latest block number
        const latestBlock = await publicClient.getBlockNumber();

        // Search for logs from the insurance contract
        const logs = await publicClient.getLogs({
          address: CONTRACTS.INSURANCE.address,
          fromBlock: latestBlock - BigInt(10000), // Last ~10000 blocks
          toBlock: 'latest',
        });

        // Filter logs related to the user
        const userLogs = logs.filter(
          (log) => log.topics.some((topic) => topic.toLowerCase().includes(address.slice(2).toLowerCase()))
        );

        // Get transaction details
        const txPromises = userLogs.map(async (log) => {
          const tx = await publicClient.getTransaction({
            hash: log.transactionHash!,
          });

          const block = await publicClient.getBlock({
            blockNumber: log.blockNumber!,
          });

          const receipt = await publicClient.getTransactionReceipt({
            hash: log.transactionHash!,
          });

          return {
            hash: log.transactionHash!,
            blockNumber: log.blockNumber!,
            timestamp: Number(block.timestamp),
            from: tx.from,
            to: tx.to || CONTRACTS.INSURANCE.address,
            functionName: 'Transaction', // Simplified
            status: receipt.status === 'success' ? 'success' : 'failed',
          } as Transaction;
        });

        const txs = await Promise.all(txPromises);

        // Sort by block number descending
        txs.sort((a, b) => Number(b.blockNumber - a.blockNumber));

        setTransactions(txs);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, publicClient]);

  return {
    transactions,
    isLoading,
    error,
  };
}
