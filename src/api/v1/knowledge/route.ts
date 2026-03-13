import { apiFetch } from "@/lib/api";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export interface KnowledgeChunk {
  id: string;
  businessId: string;
  content: string;
  sourceLabel: string | null;
  tokenCount: number;
  createdAt: string;
}

export async function listKnowledgeChunks(
  businessId: string,
  token?: string | null
): Promise<KnowledgeChunk[]> {
  void token;
  return apiFetch<KnowledgeChunk[]>(`/knowledge/${businessId}/chunks`);
}

export async function uploadKnowledgeFile(
  businessId: string,
  file: File,
  sourceLabel: string,
  token: string | null
): Promise<{ chunksCreated: number; message: string }> {
  const formData = new FormData();
  formData.append("file", file);
  if (sourceLabel) formData.append("sourceLabel", sourceLabel);

  const res = await fetch(`${BACKEND_URL}/api/knowledge/${businessId}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    const err = new Error(json.error || "Upload failed") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return json.data;
}

export async function deleteKnowledgeChunk(
  businessId: string,
  chunkId: string,
  token?: string | null
): Promise<void> {
  void token;
  await apiFetch(`/knowledge/${businessId}/chunks/${chunkId}`, { method: "DELETE" });
}
