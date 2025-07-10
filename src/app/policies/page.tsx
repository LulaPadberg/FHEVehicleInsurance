'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PolicyCard } from '@/components/insurance/PolicyCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useAccount } from 'wagmi';
import { useUserPolicies } from '@/hooks/usePolicies';
import { useGetPolicy } from '@/hooks/useInsurance';
import { FileText } from 'lucide-react';

export default function PoliciesPage() {
  const { address, isConnected } = useAccount();
  const { policies, isLoading, isError } = useUserPolicies(address);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground">
              Please connect your wallet to view your policies
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">My Policies</h1>
              <p className="text-muted-foreground">
                View and manage your insurance policies
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {isError && (
            <ErrorMessage
              title="Failed to Load Policies"
              message="Unable to fetch your policies. Please try again."
            />
          )}

          {!isLoading && !isError && (!policies || policies.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                You don't have any policies yet. Create one from the home page!
              </p>
            </div>
          )}

          {!isLoading && !isError && policies && policies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map((policyId) => (
                <PolicyDisplay key={policyId.toString()} policyId={policyId} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PolicyDisplay({ policyId }: { policyId: bigint }) {
  const { policy, isLoading } = useGetPolicy(policyId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!policy) return null;

  return (
    <PolicyCard
      policy={{
        id: policyId,
        holder: policy[0] as `0x${string}`,
        age: Number(policy[1]),
        drivingYears: Number(policy[2]),
        vehicleValue: Number(policy[3]),
        premium: Number(policy[4]),
        isActive: policy[5] as boolean,
        createdAt: new Date(),
      }}
    />
  );
}
