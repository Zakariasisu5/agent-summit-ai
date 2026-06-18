/**
 * Server functions for the Credentials page.
 * Upload bytes to 0G Storage, return a real rootHash, and let the client
 * register the hash on-chain via wagmi (signed by the user's own wallet).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ethers } from "ethers";

const uploadInput = z.object({
  filename: z.string().min(1).max(200),
  contentBase64: z.string().min(1),
});

export const uploadCredential = createServerFn({ method: "POST" })
  .inputValidator((d) => uploadInput.parse(d))
  .handler(async ({ data }) => {
    const bytes = Uint8Array.from(Buffer.from(data.contentBase64, "base64"));
    const { uploadFile } = await import("./zg-storage.server");
    const result = await uploadFile(bytes, data.filename);
    const credentialHash = ethers.keccak256(bytes) as `0x${string}`;
    return {
      filename: data.filename,
      size: bytes.byteLength,
      rootHash: result.rootHash,
      txHash: result.txHash,
      credentialHash,
      storageURI: `0g://${result.rootHash}`,
      uploadedAt: new Date().toISOString(),
    };
  });

const verifyInput = z.object({
  rootHash: z.string().min(4),
  contentBase64: z.string().min(1),
});

export const verifyCredentialBytes = createServerFn({ method: "POST" })
  .inputValidator((d) => verifyInput.parse(d))
  .handler(async ({ data }) => {
    const bytes = Uint8Array.from(Buffer.from(data.contentBase64, "base64"));
    const { verifyFile } = await import("./zg-storage.server");
    const ok = await verifyFile(bytes, data.rootHash);
    return { ok };
  });

export type CredentialUpload = Awaited<ReturnType<typeof uploadCredential>>;
