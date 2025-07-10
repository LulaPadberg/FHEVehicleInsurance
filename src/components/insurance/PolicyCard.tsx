'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatAddress, formatCurrency, formatDate } from '@/lib/utils';
import type { Policy } from '@/types/insurance';
import { Calendar, DollarSign, User } from 'lucide-react';

interface PolicyCardProps {
  policy: Policy;
}

export function PolicyCard({ policy }: PolicyCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Policy #{policy.id.toString()}
        </CardTitle>
        <StatusBadge variant={policy.isActive ? 'success' : 'secondary'}>
          {policy.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <User className="h-4 w-4" />
              Holder
            </span>
            <span className="font-mono">{formatAddress(policy.holder)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Age</span>
            <span className="font-medium">{policy.age} years</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Driving Experience</span>
            <span className="font-medium">{policy.drivingYears} years</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Vehicle Value
            </span>
            <span className="font-medium">
              {formatCurrency(policy.vehicleValue)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Annual Premium
            </span>
            <span className="font-medium text-primary">
              {formatCurrency(policy.premium)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created
            </span>
            <span className="text-xs">
              {formatDate(policy.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
