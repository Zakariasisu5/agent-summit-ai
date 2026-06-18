/**
 * 0G Storage server-side service.
 *
 * Uses the official @0glabs/0g-ts-sdk. This runs only inside server functions
 * (createServerFn handlers). It requires a funded signer via ZG_STORAGE_PRIVATE_KEY.
 *
 * If env is incomplete OR the SDK fails in the host runtime, every export
 * throws a typed Error — the API surface MUST NOT fall back to mock data.
 */

import { ethers } from "ethers";

const ZG_RPC = process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai";
const ZG_INDEXER =
  process.env.NEXT_PUBLIC_0G_STORAGE_INDEXER ||
  process.env.NEXT_PUBLIC_0G_STORAGE_URL ||
  "https://indexer-storage-testnet-turbo.0g.ai";

export class ZgStorageError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ZgStorageError";
  }
}

function getSigner() {
  const pk = process.env.ZG_STORAGE_PRIVATE_KEY;
  if (!pk) {
    throw new ZgStorageError(
      "ZG_STORAGE_PRIVATE_KEY is not configured. Add a funded 0G testnet key to enable uploads.",
      "missing_key",
    );
  }
  const provider = new ethers.JsonRpcProvider(ZG_RPC);
  return new ethers.Wallet(pk, provider);
}

async function loadSdk() {
  try {
    return await import("@0glabs/0g-ts-sdk");
  } catch (e: any) {
    throw new ZgStorageError(
      `0G Storage SDK failed to load in this runtime: ${e?.message ?? e}`,
      "sdk_unavailable",
    );
  }
}

export interface UploadResult {
  rootHash: string;
  txHash: string;
  size: number;
}

/** Upload a Buffer/Uint8Array to 0G Storage. Returns the real rootHash. */
export async function uploadFile(
  data: Uint8Array,
  _filename: string,
): Promise<UploadResult> {
  const sdk: any = await loadSdk();
  const signer = getSigner();
  const indexer = new sdk.Indexer(ZG_INDEXER);

  // ZgFile / Blob API differs slightly across SDK versions — try both.
  const Blob = sdk.Blob ?? sdk.ZgFile;
  if (!Blob) {
    throw new ZgStorageError("0G SDK does not expose Blob/ZgFile", "sdk_shape");
  }
  const file = new Blob(Buffer.from(data));
  const [tree, treeErr] = await file.merkleTree();
  if (treeErr) {
    throw new ZgStorageError(`merkleTree failed: ${treeErr}`, "merkle_failed");
  }
  const rootHash: string = tree.rootHash();

  const [tx, uploadErr] = await indexer.upload(file, ZG_RPC, signer);
  if (uploadErr) {
    throw new ZgStorageError(`upload failed: ${uploadErr}`, "upload_failed");
  }
  return { rootHash, txHash: tx, size: data.byteLength };
}

/** Retrieve raw bytes by rootHash. */
export async function retrieveFile(rootHash: string): Promise<Uint8Array> {
  const sdk: any = await loadSdk();
  const indexer = new sdk.Indexer(ZG_INDEXER);
  const tmpPath = `/tmp/${rootHash}.bin`;
  const err = await indexer.download(rootHash, tmpPath, true);
  if (err) {
    throw new ZgStorageError(`download failed: ${err}`, "download_failed");
  }
  const fs = await import("fs/promises");
  return new Uint8Array(await fs.readFile(tmpPath));
}

/** Verify a local payload matches an on-chain root hash. */
export async function verifyFile(data: Uint8Array, rootHash: string): Promise<boolean> {
  const sdk: any = await loadSdk();
  const Blob = sdk.Blob ?? sdk.ZgFile;
  const file = new Blob(Buffer.from(data));
  const [tree, treeErr] = await file.merkleTree();
  if (treeErr) throw new ZgStorageError(`merkleTree failed: ${treeErr}`, "merkle_failed");
  return tree.rootHash().toLowerCase() === rootHash.toLowerCase();
}

export function getStorageHash(data: Uint8Array): string {
  return ethers.keccak256(data);
}
