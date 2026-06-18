/**
 * Minimal ABIs for the three CredLayer registries.
 * The Solidity sources live in services/contracts/ and are deployed by the team.
 * Once deployed, set NEXT_PUBLIC_CONTRACT_* env vars to the addresses.
 *
 * Any read/write performed by the UI MUST use these ABIs against the
 * configured addresses on 0G Chain — no mock returns.
 */

export const IdentityRegistryABI = [
  {
    type: "function",
    name: "createIdentity",
    stateMutability: "nonpayable",
    inputs: [{ name: "metadataURI", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getIdentity",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "exists", type: "bool" },
      { name: "metadataURI", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "IdentityCreated",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "metadataURI", type: "string", indexed: false },
    ],
  },
] as const;

export const ReputationRegistryABI = [
  {
    type: "function",
    name: "updateReputation",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "trustScore", type: "uint16" },
      { name: "reportHash", type: "bytes32" },
      { name: "storageURI", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getTrustScore",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "score", type: "uint16" },
      { name: "updatedAt", type: "uint256" },
      { name: "reportHash", type: "bytes32" },
      { name: "storageURI", type: "string" },
    ],
  },
  {
    type: "event",
    name: "ReputationUpdated",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "trustScore", type: "uint16", indexed: false },
      { name: "reportHash", type: "bytes32", indexed: false },
      { name: "storageURI", type: "string", indexed: false },
    ],
  },
] as const;

export const CredentialRegistryABI = [
  {
    type: "function",
    name: "registerCredential",
    stateMutability: "nonpayable",
    inputs: [
      { name: "credentialHash", type: "bytes32" },
      { name: "storageURI", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "verifyCredential",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "credentialHash", type: "bytes32" },
    ],
    outputs: [{ name: "ok", type: "bool" }],
  },
  {
    type: "function",
    name: "getCredential",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [
      { name: "credentialHash", type: "bytes32" },
      { name: "storageURI", type: "string" },
      { name: "registeredAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "credentialCount",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "count", type: "uint256" }],
  },
] as const;

function getEnv(key: string): string {
  const v =
    (import.meta as any).env?.[`VITE_${key}`] ??
    (import.meta as any).env?.[`NEXT_PUBLIC_${key}`] ??
    "";
  return v as string;
}

export const CONTRACT_ADDRESSES = {
  identity: getEnv("CONTRACT_IDENTITY") as `0x${string}` | "",
  reputation: getEnv("CONTRACT_REPUTATION") as `0x${string}` | "",
  credential: getEnv("CONTRACT_CREDENTIAL") as `0x${string}` | "",
};

export function contractsConfigured(): boolean {
  return Boolean(
    CONTRACT_ADDRESSES.identity &&
      CONTRACT_ADDRESSES.reputation &&
      CONTRACT_ADDRESSES.credential,
  );
}
