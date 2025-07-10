'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ClaimCard } from '@/components/insurance/ClaimCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { usePolicyClaims } from '@/hooks/useClaims';
import { useGetClaim } from '@/hooks/useInsurance';
import { AlertCircle } from 'lucide-react';

export default function ClaimsPage() {
  const { address, isConnected } = useAccount();
  const [policyId, setPolicyId] = useState('');
  const [searchPolicyId, setSearchPolicyId] = useState<bigint | undefined>();

  const { claims, isLoading, isError } = usePolicyClaims(searchPolicyId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (policyId) {
      setSearchPolicyId(BigInt(policyId));
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground">
              Please connect your wallet to view claims
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
            <AlertCircle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Claims</h1>
              <p className="text-muted-foreground">
                View claims for your policies
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mb-8 flex gap-4">
            <div className="flex-1">
              <Label htmlFor="policyId">Enter Policy ID</Label>
              <Input
                id="policyId"
                type="number"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                placeholder="Enter policy ID to view claims"
              />
            </div>
            <Button type="submit" className="mt-auto">
              Search
            </Button>
          </form>

          {isLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {isError && (
            <ErrorMessage
              title="Failed to Load Claims"
              message="Unable to fetch claims for this policy. Please try again."
            />
          )}

          {!isLoading && !isError && searchPolicyId && (!claims || claims.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No claims found for Policy #{searchPolicyId.toString()}
              </p>
            </div>
          )}

          {!isLoading && !isError && claims && claims.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claims.map((claimId) => (
                <ClaimDisplay key={claimId.toString()} claimId={claimId} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ClaimDisplay({ claimId }: { claimId: bigint }) {
  const { claim, isLoading } = useGetClaim(claimId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!claim) return null;

  return (
    <ClaimCard
      claim={{
        id: claimId,
        policyId: claim[0] as bigint,
        claimant: claim[1] as `0x${string}`,
        damageAmount: Number(claim[2]),
        repairCost: Number(claim[3]),
        severity: Number(claim[4]),
        status: Number(claim[5]),
        documentHash: claim[6] as string,
        timestamp: new Date(),
      }}
    />
  );
}
