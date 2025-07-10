import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ClaimStatus } from '@/types/insurance';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        secondary: 'bg-secondary text-secondary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ children, variant, className }: StatusBadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
  className?: string;
}

export function ClaimStatusBadge({ status, className }: ClaimStatusBadgeProps) {
  const getStatusVariant = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Submitted:
        return 'info';
      case ClaimStatus.UnderReview:
        return 'warning';
      case ClaimStatus.Approved:
        return 'success';
      case ClaimStatus.Rejected:
        return 'error';
      case ClaimStatus.Paid:
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Submitted:
        return 'Submitted';
      case ClaimStatus.UnderReview:
        return 'Under Review';
      case ClaimStatus.Approved:
        return 'Approved';
      case ClaimStatus.Rejected:
        return 'Rejected';
      case ClaimStatus.Paid:
        return 'Paid';
      default:
        return 'Unknown';
    }
  };

  return (
    <StatusBadge variant={getStatusVariant(status)} className={className}>
      {getStatusLabel(status)}
    </StatusBadge>
  );
}
