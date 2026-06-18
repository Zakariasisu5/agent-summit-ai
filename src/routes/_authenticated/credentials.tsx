import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAccount, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { FileCheck2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  uploadCredential,
  type CredentialUpload,
} from "@/lib/credentials.functions";
import { CONTRACT_ADDRESSES, CredentialRegistryABI } from "@/contracts";

export const Route = createFileRoute("/_authenticated/credentials")({
  head: () => ({ meta: [{ title: "Credentials · CredLayer" }] }),
  component: CredentialsPage,
});

function CredentialsPage() {
  const { address } = useAccount();
  const upload = useServerFn(uploadCredential);
  const [items, setItems] = useState<CredentialUpload[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const { writeContractAsync, isPending: isAnchoring } = useWriteContract();

  const mut = useMutation({
    mutationFn: async (f: File) => {
      const b = new Uint8Array(await f.arrayBuffer());
      let bin = "";
      b.forEach((x) => (bin += String.fromCharCode(x)));
      const contentBase64 = btoa(bin);
      return upload({ data: { filename: f.name, contentBase64 } });
    },
    onSuccess: (res) => {
      setItems((p) => [res, ...p]);
      toast.success("Stored on 0G Storage", { description: res.rootHash });
    },
    onError: (e: any) =>
      toast.error("Upload failed", { description: e?.message ?? "Unknown" }),
  });

  async function anchor(c: CredentialUpload) {
    if (!CONTRACT_ADDRESSES.credential) {
      toast.error("CredentialRegistry not configured");
      return;
    }
    try {
      const tx = await writeContractAsync({
        abi: CredentialRegistryABI,
        address: CONTRACT_ADDRESSES.credential,
        functionName: "registerCredential",
        args: [c.credentialHash, c.storageURI],
      });
      toast.success("Anchored on 0G Chain", { description: tx });
    } catch (e: any) {
      toast.error("Anchor failed", { description: e?.shortMessage ?? e?.message });
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Credentials</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a credential payload to 0G Storage; the rootHash and on-chain anchor are
          verifiable by anyone.
        </p>
      </header>

      <section className="glass-strong p-6">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">
              Credential file
            </label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2"
            />
          </div>
          <Button
            onClick={() => file && mut.mutate(file)}
            disabled={!file || mut.isPending || !address}
            size="lg"
          >
            {mut.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading to 0G…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload to 0G Storage
              </>
            )}
          </Button>
        </div>
      </section>

      <section className="glass-panel p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Your credentials</h2>
          <Badge variant="outline" className="text-xs">
            Stored on 0G Storage
          </Badge>
        </div>

        {!items.length ? (
          <div className="mt-4 grid place-items-center rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            <FileCheck2 className="mb-2 h-6 w-6" />
            No credentials uploaded yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((c) => (
              <div
                key={c.rootHash}
                className="grid gap-3 rounded-md border border-border bg-card/40 p-4 text-sm md:grid-cols-[1fr_auto]"
              >
                <div className="space-y-1">
                  <div className="font-medium">{c.filename}</div>
                  <div className="text-xs text-muted-foreground">
                    {(c.size / 1024).toFixed(1)} KB · {new Date(c.uploadedAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Storage hash
                    </span>
                    <code className="ml-2 break-all font-mono text-xs">{c.rootHash}</code>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Credential hash
                    </span>
                    <code className="ml-2 break-all font-mono text-xs">
                      {c.credentialHash}
                    </code>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Stored
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAnchoring}
                    onClick={() => anchor(c)}
                  >
                    Anchor on-chain
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
