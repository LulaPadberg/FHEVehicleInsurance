'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useCreatePolicy } from '@/hooks/useInsurance';
import { validatePolicyData } from '@/lib/utils';

export function PolicyForm() {
  const { address, isConnected } = useAccount();
  const { createPolicy, isLoading, error } = useCreatePolicy();

  const [formData, setFormData] = useState({
    age: 25,
    drivingYears: 5,
    vehicleValue: 25000,
    premium: 1200,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validation = validatePolicyData(formData);
    if (!validation.valid) {
      setValidationError(validation.errors.join(', '));
      return;
    }

    try {
      await createPolicy(formData);
      // Reset form on success
      setFormData({
        age: 25,
        drivingYears: 5,
        vehicleValue: 25000,
        premium: 1200,
      });
    } catch (err) {
      console.error('Policy creation failed:', err);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please connect your wallet to create a policy
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Policy</CardTitle>
        <CardDescription>
          Fill in your details to create a new insurance policy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="age">Age (18-100)</Label>
            <Input
              id="age"
              type="number"
              min={18}
              max={100}
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: parseInt(e.target.value) || 18 })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drivingYears">Driving Experience (years)</Label>
            <Input
              id="drivingYears"
              type="number"
              min={0}
              max={80}
              value={formData.drivingYears}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  drivingYears: parseInt(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleValue">Vehicle Value (USD)</Label>
            <Input
              id="vehicleValue"
              type="number"
              min={1}
              value={formData.vehicleValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vehicleValue: parseInt(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="premium">Annual Premium (USD)</Label>
            <Input
              id="premium"
              type="number"
              min={1}
              value={formData.premium}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  premium: parseInt(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          {validationError && (
            <ErrorMessage message={validationError} />
          )}

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
                Creating Policy...
              </>
            ) : (
              'Create Policy'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
