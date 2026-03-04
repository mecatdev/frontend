const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api`;

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
      credentials: "include",
      signal: controller.signal,
    });

    let json: ApiResponse<T>;
    try {
      json = await res.json();
    } catch {
      // Non-JSON response (backend down, proxy error, HTML error page)
      throw new Error(`Server error (${res.status}): backend may be unavailable`);
    }

    if (!res.ok || !json.success) {
      const err = new Error(json.error || "API request failed") as Error & { status: number };
      err.status = res.status;
      throw err;
    }

    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}