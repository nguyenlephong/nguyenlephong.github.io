import type { AssetRef } from "./url-resolver";

export type MediaUploadRequest = Readonly<{
  key: string;
  contentType: string;
  sizeBytes: number;
  checksumSha256: string;
}>;

export type MediaUploadGrant = Readonly<{
  uploadUrl: string;
  method: "PUT";
  requiredHeaders: Readonly<Record<string, string>>;
  expiresAt: string;
  asset: AssetRef;
  finalizeToken: string;
}>;

export type MediaUploadResult = Readonly<{
  asset: AssetRef;
  sizeBytes: number;
  checksumSha256: string;
}>;

/**
 * Browser-facing control-plane port. Implementations call a trusted signer;
 * they never hold R2 access keys or generate signatures in the client.
 */
export interface MediaUploadPort {
  requestUpload(request: MediaUploadRequest): Promise<MediaUploadGrant>;
  finalizeUpload(grant: MediaUploadGrant): Promise<MediaUploadResult>;
  requestPrivateRead(asset: AssetRef): Promise<{ url: string; expiresAt: string }>;
}
