'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { useFhevmClient, useEncrypt } from '@fhevm/universal-sdk/react';

const CONTRACT_ADDRESS = '0x2A86c562acc0a861A96E4114d7323987e313795F';
const CONTRACT_ABI = [
  'function createPolicy(bytes calldata encryptedAge, bytes calldata encryptedDrivingYears, bytes calldata encryptedVehicleValue, bytes calldata encryptedPremium, bytes calldata inputProof) external returns (uint256)',
  'function submitClaim(uint256 _policyId, bytes calldata encryptedDamageAmount, bytes calldata encryptedRepairCost, uint8 _severity, string memory _documentHash, bool _isConfidential, bytes calldata inputProof) external returns (uint256)',
  'function reviewClaim(uint256 _claimId, bytes calldata encryptedAssessedDamage, bytes calldata encryptedRecommendedPayout, string memory _reviewNotes, uint8 _newStatus, bytes calldata inputProof) external',
  'function getClaimsByHolder(address _holder) external view returns (uint256[] memory)',
  'function getPoliciesByHolder(address _holder) external view returns (uint256[] memory)',
  'event PolicyCreated(uint256 indexed policyId, address indexed holder)',
  'event ClaimSubmitted(uint256 indexed claimId, uint256 indexed policyId, address indexed claimant)',
  'event ClaimReviewed(uint256 indexed claimId, address indexed reviewer, uint8 newStatus)',
];

export default function Home() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [policyCount, setPolicyCount] = useState(0);
  const [claimCount, setClaimCount] = useState(0);

  // Form states
  const [age, setAge] = useState('25');
  const [drivingYears, setDrivingYears] = useState('5');
  const [vehicleValue, setVehicleValue] = useState('25000');
  const [premium, setPremium] = useState('1200');

  const [policyId, setPolicyId] = useState('');
  const [damageAmount, setDamageAmount] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [severity, setSeverity] = useState('0');
  const [documentHash, setDocumentHash] = useState('');
  const [confidential, setConfidential] = useState(false);

  const [reviewClaimId, setReviewClaimId] = useState('');
  const [assessedDamage, setAssessedDamage] = useState('');
  const [recommendedPayout, setRecommendedPayout] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [claimStatus, setClaimStatus] = useState('2');

  // Initialize FHEVM
  const { client, isReady, isLoading, error } = useFhevmClient({
    network: {
      chainId: 11155111, // Sepolia
      rpcUrl: 'https://sepolia.infura.io/v3/',
      name: 'Sepolia Testnet',
    },
  });

  const { encryptValue, isEncrypting } = useEncrypt();

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Test Network',
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                },
              ],
            });
          }
        }
      }

      const providerInstance = new BrowserProvider(window.ethereum);
      const signer = await providerInstance.getSigner();
      const address = await signer.getAddress();
      const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setProvider(providerInstance);
      setContract(contractInstance);
      setUserAddress(address);
      setConnected(true);

      await updateUserStatus(contractInstance, address);
      alert('Connected to Sepolia! ✅');
    } catch (error: any) {
      console.error('Connection failed:', error);
      alert('Connection failed: ' + error.message);
    }
  };

  const updateUserStatus = async (contractInstance: Contract, address: string) => {
    try {
      const policies = await contractInstance.getPoliciesByHolder(address);
      const claims = await contractInstance.getClaimsByHolder(address);
      setPolicyCount(policies.length);
      setClaimCount(claims.length);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const createPolicy = async () => {
    if (!contract || !isReady) {
      alert('Please connect your wallet and wait for FHEVM initialization');
      return;
    }

    try {
      // Encrypt policy data
      const encryptedAge = await encryptValue('uint32', parseInt(age));
      const encryptedDrivingYears = await encryptValue('uint32', parseInt(drivingYears));
      const encryptedVehicleValue = await encryptValue('uint32', parseInt(vehicleValue));
      const encryptedPremium = await encryptValue('uint32', parseInt(premium));

      if (!encryptedAge || !encryptedDrivingYears || !encryptedVehicleValue || !encryptedPremium) {
        alert('Encryption failed');
        return;
      }

      // Generate input proof
      const inputProof = client?.instance?.generateProof([
        encryptedAge,
        encryptedDrivingYears,
        encryptedVehicleValue,
        encryptedPremium,
      ]) || '0x';

      const tx = await contract.createPolicy(
        encryptedAge,
        encryptedDrivingYears,
        encryptedVehicleValue,
        encryptedPremium,
        inputProof
      );

      alert('Policy creation transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();

      alert('Policy created successfully!');
      await updateUserStatus(contract, userAddress);
    } catch (error: any) {
      console.error('Error creating policy:', error);
      alert('Error creating policy: ' + error.message);
    }
  };

  const submitClaim = async () => {
    if (!contract || !isReady) {
      alert('Please connect your wallet and wait for FHEVM initialization');
      return;
    }

    try {
      const encryptedDamage = await encryptValue('uint32', parseInt(damageAmount));
      const encryptedRepair = await encryptValue('uint32', parseInt(repairCost));

      if (!encryptedDamage || !encryptedRepair) {
        alert('Encryption failed');
        return;
      }

      const inputProof = client?.instance?.generateProof([
        encryptedDamage,
        encryptedRepair,
      ]) || '0x';

      const tx = await contract.submitClaim(
        parseInt(policyId),
        encryptedDamage,
        encryptedRepair,
        parseInt(severity),
        documentHash,
        confidential,
        inputProof
      );

      alert('Claim submission transaction submitted. Waiting for confirmation...');
      await tx.wait();
      alert('Claim submitted successfully!');
      await updateUserStatus(contract, userAddress);
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      alert('Error submitting claim: ' + error.message);
    }
  };

  const reviewClaim = async () => {
    if (!contract || !isReady) {
      alert('Please connect your wallet and wait for FHEVM initialization');
      return;
    }

    try {
      const encryptedAssessed = await encryptValue('uint32', parseInt(assessedDamage));
      const encryptedPayout = await encryptValue('uint32', parseInt(recommendedPayout));

      if (!encryptedAssessed || !encryptedPayout) {
        alert('Encryption failed');
        return;
      }

      const inputProof = client?.instance?.generateProof([
        encryptedAssessed,
        encryptedPayout,
      ]) || '0x';

      const tx = await contract.reviewClaim(
        parseInt(reviewClaimId),
        encryptedAssessed,
        encryptedPayout,
        reviewNotes,
        parseInt(claimStatus),
        inputProof
      );

      alert('Claim review transaction submitted. Waiting for confirmation...');
      await tx.wait();
      alert('Claim reviewed successfully!');
    } catch (error: any) {
      console.error('Error reviewing claim:', error);
      alert('Error reviewing claim: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Initializing FHEVM...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Connection Status */}
      <div className="fixed top-5 right-5 z-50">
        <div
          className={`status-badge ${
            connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {connected ? '✓ Connected to Sepolia' : '✗ Not Connected'}
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          🚗 Private Vehicle Insurance
        </h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto">
          Secure, confidential insurance processing powered by Zama FHE technology.
          Your personal information remains encrypted and private throughout the entire process.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Policy Card */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Create Insurance Policy
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>🔒 Privacy Protected:</strong> All your personal information is encrypted
              using FHE technology.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Age (18-100)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field"
                min="18"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Years of Driving Experience
              </label>
              <input
                type="number"
                value={drivingYears}
                onChange={(e) => setDrivingYears(e.target.value)}
                className="input-field"
                min="0"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Value (USD)</label>
              <input
                type="number"
                value={vehicleValue}
                onChange={(e) => setVehicleValue(e.target.value)}
                className="input-field"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Annual Premium (USD)</label>
              <input
                type="number"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
                className="input-field"
                min="1"
              />
            </div>
            <button
              onClick={createPolicy}
              disabled={!connected || !isReady || isEncrypting}
              className="btn-primary"
            >
              {isEncrypting ? 'Encrypting...' : 'Create Policy'}
            </button>
          </div>
        </div>

        {/* Submit Claim Card */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">📑</span>
            Submit Insurance Claim
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>🔒 Confidential Claims:</strong> All damage amounts and repair costs are
              encrypted.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Policy ID</label>
              <input
                type="number"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Damage Amount (USD)</label>
              <input
                type="number"
                value={damageAmount}
                onChange={(e) => setDamageAmount(e.target.value)}
                className="input-field"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Repair Cost (USD)</label>
              <input
                type="number"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                className="input-field"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Accident Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="input-field"
              >
                <option value="0">Minor (0-25%)</option>
                <option value="1">Moderate (26-50%)</option>
                <option value="2">Major (51-75%)</option>
                <option value="3">Severe (76-100%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Document Hash (IPFS)</label>
              <input
                type="text"
                value={documentHash}
                onChange={(e) => setDocumentHash(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="confidential"
                checked={confidential}
                onChange={(e) => setConfidential(e.target.checked)}
              />
              <label htmlFor="confidential" className="text-sm">
                Mark as confidential claim
              </label>
            </div>
            <button
              onClick={submitClaim}
              disabled={!connected || !isReady || isEncrypting}
              className="btn-primary"
            >
              {isEncrypting ? 'Encrypting...' : 'Submit Claim'}
            </button>
          </div>
        </div>

        {/* Review Claim Card */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">👥</span>
            Review Claim
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Claim ID</label>
              <input
                type="number"
                value={reviewClaimId}
                onChange={(e) => setReviewClaimId(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Assessed Damage (USD)</label>
              <input
                type="number"
                value={assessedDamage}
                onChange={(e) => setAssessedDamage(e.target.value)}
                className="input-field"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Recommended Payout (USD)</label>
              <input
                type="number"
                value={recommendedPayout}
                onChange={(e) => setRecommendedPayout(e.target.value)}
                className="input-field"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="input-field"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Status</label>
              <select
                value={claimStatus}
                onChange={(e) => setClaimStatus(e.target.value)}
                className="input-field"
              >
                <option value="2">Under Review</option>
                <option value="3">Approved</option>
                <option value="4">Rejected</option>
              </select>
            </div>
            <button
              onClick={reviewClaim}
              disabled={!connected || !isReady || isEncrypting}
              className="btn-primary"
            >
              {isEncrypting ? 'Encrypting...' : 'Submit Review'}
            </button>
          </div>
        </div>

        {/* Status Dashboard */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">📊</span>
            Insurance Status Dashboard
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Connected Account</h4>
              <p className="text-sm text-gray-600 break-all">
                {connected ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Not connected'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Contract Address</h4>
              <p className="text-sm text-gray-600 break-all">
                {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">My Policies</h4>
              <p className="text-sm text-gray-600">{policyCount} policies</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">My Claims</h4>
              <p className="text-sm text-gray-600">{claimCount} claims</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Network</h4>
              <p className="text-sm text-gray-600">Sepolia Testnet</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Privacy Status</h4>
              <p className="text-sm text-gray-600">🔒 FHE Encrypted</p>
            </div>
          </div>
          <button onClick={connectWallet} className="btn-primary">
            {connected ? 'Reconnect Wallet' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
}
