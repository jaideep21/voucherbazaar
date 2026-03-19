import { HttpAgent } from "@icp-sdk/core/agent";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

interface StorageContextValue {
  getImageUrl: (imageId: string) => string;
  uploadFile: (
    file: File,
    onProgress?: (pct: number) => void,
  ) => Promise<string>;
  isReady: boolean;
}

const StorageContext = createContext<StorageContextValue>({
  getImageUrl: () => "",
  uploadFile: async () => {
    throw new Error("Storage not ready");
  },
  isReady: false,
});

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [storageClient, setStorageClient] = useState<StorageClient | null>(
    null,
  );
  const [urlConfig, setUrlConfig] = useState<{
    gatewayUrl: string;
    canisterId: string;
    projectId: string;
  } | null>(null);

  useEffect(() => {
    loadConfig().then((config) => {
      const agent = new HttpAgent({ host: config.backend_host });
      const client = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      setStorageClient(client);
      setUrlConfig({
        gatewayUrl: config.storage_gateway_url,
        canisterId: config.backend_canister_id,
        projectId: config.project_id,
      });
    });
  }, []);

  const getImageUrl = (imageId: string): string => {
    if (!urlConfig || !imageId) return "";
    const { gatewayUrl, canisterId, projectId } = urlConfig;
    return `${gatewayUrl}/v1/blob/?blob_hash=${encodeURIComponent(imageId)}&owner_id=${encodeURIComponent(canisterId)}&project_id=${encodeURIComponent(projectId)}`;
  };

  const uploadFile = async (
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> => {
    if (!storageClient) throw new Error("Storage not ready");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { hash } = await storageClient.putFile(bytes, onProgress);
    return hash;
  };

  return (
    <StorageContext.Provider
      value={{ getImageUrl, uploadFile, isReady: !!storageClient }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  return useContext(StorageContext);
}
