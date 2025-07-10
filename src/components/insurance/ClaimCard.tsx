'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClaimStatusBadge } from '@/components/shared/StatusBadge';
import { formatAddress, formatCurrency, formatDate } from '@/lib/utils';
import type { Claim } from '@/types/insurance';
import { AlertCircle, Calendar, DollarSign, FileText } from 'lucide-react';

interface ClaimCardProps {
  claim: Claim;
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const getSeverityLabel = (severity: number) => {
    const labels = ['Minor', 'Moderate', 'Severe', 'Total Loss'];
    return labels[severity] || 'Unknown';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Claim #{claim.id.toString()}
        </CardTitle>
        <ClaimStatusBadge status={claim.status} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Policy ID
            </span>
            <span className="font-mono">#{claim.policyId.toString()}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Claimant</span>
            <span className="font-mono">{formatAddress(claim.claimant)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Damage Amount
            </span>
            <span className="font-medium">
              {formatCurrency(claim.damageAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Repair Cost
            </span>
            <span className="font-medium">
              {formatCurrency(claim.repairCost)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Severity
            </span>
            <span className="font-medium">{getSeverityLabel(claim.severity)}</span>
          </div>

          {claim.documentHash && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Document</span>
              <a
                href={`https://ipfs.io/ipfs/${claim.documentHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs"
              >
                View on IPFS
              </a>
            </div>
          )}

          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Submitted
            </span>
            <span className="text-xs">
              {formatDate(claim.timestamp)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
