import { apiFetch } from "@/lib/api";

export interface InvestorDeal {
  id: string;
  status: string;
  investmentAmount: number | null;
  equityPct: number | null;
  preMoneyValuation: number | null;
  createdAt: string;
  updatedAt: string;
  business: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    industry: string | null;
    stage: string | null;
  };
}

export interface InvestorProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  totalDeals: number;
  activeDeals: number;
  deals: InvestorDeal[];
}

export async function getInvestorProfile(
  id: string,
  token?: string | null
): Promise<InvestorProfile> {
  return apiFetch<InvestorProfile>(`/investors/${id}`, {}, token);
}
