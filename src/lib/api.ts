/**
 * API client untuk backend
 *
 * - fetchBusinesses, fetchBusiness: Marketplace
 * - analyzeContract: AI #2 - analisis risiko kontrak (button "Analyze and get feedback")
 * - createVoiceSession: AI #1 - voice assistant (live respond)
 * - getDemoUserId: demo user untuk testing
 */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:4000";
const API_BASE =
  typeof window !== "undefined" ? "/api/backend" : `${BACKEND_URL}/api`;

export interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  marketSize: string | null;
  fundingAsk: number | string | null;
  fundingCurrency: string | null;
  logoUrl: string | null;
  owner: { id: string; name: string; avatarUrl: string | null };
}

// --- Generic authenticated fetch ---

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    const err = new Error(json.error || "Request failed") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return json.data;
}

// --- Contract Analysis (AI #2) ---

export interface ContractAnalysisResult {
  riskFeedback: string;
  recommendedQuestions: string[];
  risks?: Array< { severity: string; clause: string; description: string }>;
}

/** POST /api/contracts/analyze - Analisis risiko kontrak, return feedback + recommended questions */
export async function analyzeContract(
  contractText: string,
  businessId?: string
): Promise<ContractAnalysisResult> {
  const res = await fetch(`${API_BASE}/contracts/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contractText, businessId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to analyze contract");
  return json.data;
}

// --- Voice Assistant (AI #1) ---

/** POST /api/voice/session - Init voice assistant session (placeholder, nanti WebSocket/streaming) */
export async function createVoiceSession(businessId: string, userId: string) {
  const res = await fetch(`${API_BASE}/voice/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessId, userId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to create voice session");
  return json.data;
}

// --- Marketplace ---

export async function fetchBusinesses(): Promise<Business[]> {
  const res = await fetch(`${API_BASE}/businesses`, { cache: "no-store" });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to fetch businesses");
  return json.data ?? [];
}

export async function fetchBusiness(
  idOrSlug: string
): Promise<Business & { traction?: unknown; revenue?: unknown; teamInfo?: unknown }> {
  const res = await fetch(
    `${API_BASE}/businesses/${encodeURIComponent(idOrSlug)}`,
    { cache: "no-store" }
  );
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to fetch business");
  return json.data;
}

export async function getDemoUserId(): Promise<string> {
  const res = await fetch(`${API_BASE}/demo-user`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to get demo user");
  return json.data.userId;
}
