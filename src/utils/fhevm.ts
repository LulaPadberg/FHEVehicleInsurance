import { BrowserProvider, JsonRpcSigner, Contract } from "ethers";
import { initFhevm, createInstance, FhevmInstance } from "fhevmjs";

// Contract addresses - Updated 2025-10-23 after deployment
export const CONTRACT_ADDRESSES = {
  insurance: "0x07e59aEcC74578c859a89a4CD7cD40E760625890",
  pauserSet: "0xF1a0db0b5c83a341Ac44EAc5cABFbB7cbf37603D",
  gateway: "0x33347831500F1e73f0054F4F5fD90ce86b8c9e11",
  acl: "0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5",
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia
  name: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_KEY",
};

let fhevmInstance: FhevmInstance | null = null;

/**
 * Initialize FHEVM instance for encryption/decryption
 */
export async function initializeFhevm(
  provider: BrowserProvider,
  contractAddress: string
): Promise<FhevmInstance> {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  try {
    // Initialize the FHEVM library
    await initFhevm();

    // Create instance with contract public key
    fhevmInstance = await createInstance({
      chainId: NETWORK_CONFIG.chainId,
      networkUrl: NETWORK_CONFIG.rpcUrl,
      gatewayUrl: "https://gateway.sepolia.zama.ai",
      aclAddress: CONTRACT_ADDRESSES.acl,
    });

    console.log("✅ FHEVM initialized successfully");
    return fhevmInstance;
  } catch (error) {
    console.error("❌ Failed to initialize FHEVM:", error);
    throw new Error("Failed to initialize FHE encryption");
  }
}

/**
 * Get the current FHEVM instance
 */
export function getFhevmInstance(): FhevmInstance {
  if (!fhevmInstance) {
    throw new Error("FHEVM not initialized. Call initializeFhevm first.");
  }
  return fhevmInstance;
}

/**
 * Encrypt a uint32 value
 */
export async function encryptUint32(
  value: number,
  contractAddress: string
): Promise<string> {
  const instance = getFhevmInstance();

  try {
    const encrypted = instance.encrypt32(value);
    return encrypted;
  } catch (error) {
    console.error("❌ Encryption failed:", error);
    throw new Error(`Failed to encrypt value: ${value}`);
  }
}

/**
 * Encrypt multiple uint32 values
 */
export async function encryptMultipleUint32(
  values: number[],
  contractAddress: string
): Promise<string[]> {
  const instance = getFhevmInstance();

  try {
    const encrypted = values.map((value) => instance.encrypt32(value));
    return encrypted;
  } catch (error) {
    console.error("❌ Batch encryption failed:", error);
    throw new Error("Failed to encrypt values");
  }
}

/**
 * Generate EIP-712 signature for re-encryption
 */
export async function generateReencryptSignature(
  signer: JsonRpcSigner,
  contractAddress: string,
  userAddress: string
): Promise<string> {
  const instance = getFhevmInstance();

  try {
    const signature = await instance.generateToken({
      verifyingContract: contractAddress,
    });

    return signature.signature;
  } catch (error) {
    console.error("❌ Signature generation failed:", error);
    throw new Error("Failed to generate re-encryption signature");
  }
}

/**
 * Request decryption of encrypted data
 */
export async function requestDecryption(
  encryptedData: string,
  signer: JsonRpcSigner,
  contractAddress: string
): Promise<number> {
  const instance = getFhevmInstance();

  try {
    // Generate signature for re-encryption
    const signature = await generateReencryptSignature(
      signer,
      contractAddress,
      await signer.getAddress()
    );

    // Request decryption from gateway
    const decrypted = await instance.reencrypt(
      encryptedData,
      contractAddress,
      signature
    );

    return Number(decrypted);
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Create a policy with encrypted data
 */
export async function createEncryptedPolicy(
  contract: Contract,
  age: number,
  drivingYears: number,
  vehicleValue: number,
  premium: number
): Promise<any> {
  try {
    console.log("🔐 Creating policy with encrypted data...");

    // Encrypt sensitive data - NO INPUT PROOF NEEDED (auto re-randomized)
    const encryptedAge = await encryptUint32(age, await contract.getAddress());
    const encryptedDrivingYears = await encryptUint32(
      drivingYears,
      await contract.getAddress()
    );
    const encryptedVehicleValue = await encryptUint32(
      vehicleValue,
      await contract.getAddress()
    );
    const encryptedPremium = await encryptUint32(
      premium,
      await contract.getAddress()
    );

    // Submit transaction with encrypted data
    const tx = await contract.createPolicy(
      encryptedAge,
      encryptedDrivingYears,
      encryptedVehicleValue,
      encryptedPremium
    );

    console.log("📝 Transaction submitted:", tx.hash);
    const receipt = await tx.wait();

    console.log("✅ Policy created successfully!");
    return receipt;
  } catch (error) {
    console.error("❌ Failed to create policy:", error);
    throw error;
  }
}

/**
 * Submit a claim with encrypted data
 */
export async function submitEncryptedClaim(
  contract: Contract,
  policyId: number,
  damageAmount: number,
  repairCost: number,
  severity: number,
  documentHash: string,
  isConfidential: boolean
): Promise<any> {
  try {
    console.log("🔐 Submitting claim with encrypted data...");

    // Encrypt claim amounts
    const encryptedDamage = await encryptUint32(
      damageAmount,
      await contract.getAddress()
    );
    const encryptedRepair = await encryptUint32(
      repairCost,
      await contract.getAddress()
    );

    // Submit encrypted claim
    const tx = await contract.submitClaim(
      policyId,
      encryptedDamage,
      encryptedRepair,
      severity,
      documentHash,
      isConfidential
    );

    console.log("📝 Claim submitted:", tx.hash);
    const receipt = await tx.wait();

    console.log("✅ Claim submitted successfully!");
    return receipt;
  } catch (error) {
    console.error("❌ Failed to submit claim:", error);
    throw error;
  }
}

/**
 * Decrypt policy data for authorized user
 */
export async function decryptPolicyData(
  contract: Contract,
  policyId: number,
  signer: JsonRpcSigner
): Promise<{
  age: number;
  drivingYears: number;
  vehicleValue: number;
  premium: number;
}> {
  try {
    const policy = await contract.policies(policyId);

    // Request decryption for each encrypted field
    const age = await requestDecryption(
      policy.encryptedAge,
      signer,
      await contract.getAddress()
    );
    const drivingYears = await requestDecryption(
      policy.encryptedDrivingYears,
      signer,
      await contract.getAddress()
    );
    const vehicleValue = await requestDecryption(
      policy.encryptedVehicleValue,
      signer,
      await contract.getAddress()
    );
    const premium = await requestDecryption(
      policy.encryptedPremium,
      signer,
      await contract.getAddress()
    );

    return { age, drivingYears, vehicleValue, premium };
  } catch (error) {
    console.error("❌ Failed to decrypt policy data:", error);
    throw new Error("You don't have permission to view this policy data");
  }
}

/**
 * Decrypt claim data for authorized user
 */
export async function decryptClaimData(
  contract: Contract,
  claimId: number,
  signer: JsonRpcSigner
): Promise<{
  damageAmount: number;
  repairCost: number;
  approvedAmount: number;
}> {
  try {
    const claim = await contract.claims(claimId);

    const damageAmount = await requestDecryption(
      claim.encryptedDamageAmount,
      signer,
      await contract.getAddress()
    );
    const repairCost = await requestDecryption(
      claim.encryptedRepairCost,
      signer,
      await contract.getAddress()
    );
    const approvedAmount = await requestDecryption(
      claim.encryptedApprovedAmount,
      signer,
      await contract.getAddress()
    );

    return { damageAmount, repairCost, approvedAmount };
  } catch (error) {
    console.error("❌ Failed to decrypt claim data:", error);
    throw new Error("You don't have permission to view this claim data");
  }
}

/**
 * Check if gateway allows public decryption (new is... pattern)
 */
export async function checkDecryptionAllowed(
  gatewayContract: Contract
): Promise<boolean> {
  try {
    // NEW: Use isPublicDecryptAllowed instead of checkPublicDecryptAllowed
    const isAllowed = await gatewayContract.isPublicDecryptAllowed();
    return isAllowed;
  } catch (error) {
    console.error("❌ Failed to check decryption permission:", error);
    return false;
  }
}

/**
 * Utility: Format encrypted data for display
 */
export function formatEncryptedData(data: string): string {
  if (!data || data === "0x") return "Not encrypted";
  return `${data.substring(0, 10)}...${data.substring(data.length - 8)}`;
}

/**
 * Utility: Validate numeric inputs before encryption
 */
export function validateInputs(inputs: {
  age?: number;
  drivingYears?: number;
  vehicleValue?: number;
  premium?: number;
  damageAmount?: number;
  repairCost?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (inputs.age !== undefined) {
    if (inputs.age < 18 || inputs.age > 100) {
      errors.push("Age must be between 18 and 100");
    }
  }

  if (inputs.drivingYears !== undefined && inputs.age !== undefined) {
    if (inputs.drivingYears > inputs.age - 16) {
      errors.push("Driving years cannot exceed age - 16");
    }
  }

  if (inputs.vehicleValue !== undefined && inputs.vehicleValue <= 0) {
    errors.push("Vehicle value must be positive");
  }

  if (inputs.premium !== undefined && inputs.premium <= 0) {
    errors.push("Premium must be positive");
  }

  if (inputs.damageAmount !== undefined && inputs.damageAmount <= 0) {
    errors.push("Damage amount must be positive");
  }

  if (inputs.repairCost !== undefined && inputs.repairCost <= 0) {
    errors.push("Repair cost must be positive");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  initializeFhevm,
  getFhevmInstance,
  encryptUint32,
  encryptMultipleUint32,
  generateReencryptSignature,
  requestDecryption,
  createEncryptedPolicy,
  submitEncryptedClaim,
  decryptPolicyData,
  decryptClaimData,
  checkDecryptionAllowed,
  formatEncryptedData,
  validateInputs,
  CONTRACT_ADDRESSES,
  NETWORK_CONFIG,
};
