'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useSubmitClaim } from '@/hooks/useInsurance';

export function ClaimForm() {
  const { address, isConnected } = useAccount();
  const { submitClaim, isLoading, error } = useSubmitClaim();

  const [formData, setFormData] = useState({
    policyId: '',
    damageAmount: 5000,
    repairCost: 4500,
    severity: 1,
    documentHash: '',
    isConfidential: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitClaim({
        policyId: BigInt(formData.policyId),
        damageAmount: formData.damageAmount,
        repairCost: formData.repairCost,
        severity: formData.severity,
        documentHash: formData.documentHash,
        isConfidential: formData.isConfidential,
      });

      // Reset form on success
      setFormData({
        policyId: '',
        damageAmount: 5000,
        repairCost: 4500,
        severity: 1,
        documentHash: '',
        isConfidential: true,
      });
    } catch (err) {
      console.error('Claim submission failed:', err);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please connect your wallet to submit a claim
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Insurance Claim</CardTitle>
        <CardDescription>
          Submit a claim for your policy with damage details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="policyId">Policy ID</Label>
            <Input
              id="policyId"
              type="number"
              min={0}
              value={formData.policyId}
              onChange={(e) =>
                setFormData({ ...formData, policyId: e.target.value })
              }
              placeholder="Enter your policy ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="damageAmount">Damage Amount (USD)</Label>
            <Input
              id="damageAmount"
              type="number"
              min={1}
              value={formData.damageAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  damageAmount: parseInt(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repairCost">Repair Cost (USD)</Label>
            <Input
              id="repairCost"
              type="number"
              min={1}
              value={formData.repairCost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  repairCost: parseInt(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select
              value={formData.severity.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, severity: parseInt(value) })
              }
            >
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Minor</SelectItem>
                <SelectItem value="1">Moderate</SelectItem>
                <SelectItem value="2">Severe</SelectItem>
                <SelectItem value="3">Total Loss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentHash">Document Hash (IPFS)</Label>
            <Input
              id="documentHash"
              type="text"
              value={formData.documentHash}
              onChange={(e) =>
                setFormData({ ...formData, documentHash: e.target.value })
              }
              placeholder="QmXxx... (optional)"
            />
            <p className="text-xs text-muted-foreground">
              Upload claim documents to IPFS and paste the hash here
            </p>
          </div>

          {error && (
            <ErrorMessage
              title="Transaction Failed"
              message={error.message}
            />
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" size="sm" />
                Submitting Claim...
              </>
            ) : (
              'Submit Claim'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
