'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useTransactions } from '@/hooks/useTransactions';
import { formatAddress, formatDate } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

export function TransactionList() {
  const { transactions, isLoading, error } = useTransactions();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <ErrorMessage
            title="Failed to Load Transactions"
            message={error.message}
          />
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <p className="text-center text-muted-foreground">
            No transactions found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Recent transactions from your connected wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    variant={
                      tx.status === 'success'
                        ? 'success'
                        : tx.status === 'failed'
                        ? 'error'
                        : 'warning'
                    }
                  >
                    {tx.status}
                  </StatusBadge>
                  <span className="text-sm font-medium">{tx.functionName}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-mono">{formatAddress(tx.hash)}</span>
                  <span>Block {tx.blockNumber.toString()}</span>
                  <span>{formatDate(new Date(tx.timestamp * 1000))}</span>
                </div>
              </div>
              <a
                href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
