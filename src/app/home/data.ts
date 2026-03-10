import { getClerkToken } from "@/api/auth/clerk";
import type { Business } from "@/types/business";

const API_BASE = `${
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:4000"
}/api`;

const PAGE_SIZE = 8;

export type BusinessPage = {
  businesses: Business[];
  hasMore: boolean;
};

export async function fetchBusinessPage(
  page: number,
  sector?: string | null,
): Promise<BusinessPage> {
  const params = new URLSearchParams();
  params.set("page", String(page + 1));
  params.set("limit", String(PAGE_SIZE));
  if (sector) params.set("industry", sector);

  const token = await getClerkToken();
  const res = await fetch(`${API_BASE}/businesses?${params}`, {
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Failed to fetch businesses");
  }

  return {
    businesses: json.data,
    hasMore: (page + 1) * PAGE_SIZE < json.total,
  };
}
