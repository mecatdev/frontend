const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:4000";

const API_BASE =
  typeof window !== "undefined" ? "/api/backend" : `${BACKEND_URL}/api`; // optional if proxy is set

/**
 * Standard API response contract
*/
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Generic fetch wrapper
*/
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include", // important for cookie auth
      signal: controller.signal,
    });

    const json: ApiResponse<T> = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || "API request failed");
    }

    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}