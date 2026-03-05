export interface LoginResponse {
  user: { id: string; name: string; email: string; role: string };
  token: string;
  hasBusiness: boolean;
  business: {
    id: string;
    slug: string;
    verificationStatus: string;
  } | null;
}

export interface RegisterResponse {
  user: { id: string; name: string; email: string; role: string };
  token: string;
}

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/auth`;

async function authFetch<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    const err = new Error(json.error || "Request failed") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return json.data;
}

export function loginByEmail(email: string, password: string): Promise<LoginResponse> {
  return authFetch<LoginResponse>("/login", { email, password });
}

export function registerUser(name: string, email: string, password: string): Promise<RegisterResponse> {
  return authFetch<RegisterResponse>("/register/founder", { name, email, password });
}
