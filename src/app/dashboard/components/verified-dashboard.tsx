"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { type MyBusiness } from "@/api/v1/business/route";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Deal {
  investor: { id: string; name: string; email: string; avatarUrl: string | null };
  deal: {
    id: string;
    status: string;
    investmentAmount: number | null;
    equityPct: number | null;
    createdAt: string;
  };
}

function fmt(n: number | null, currency = "USD") {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact" }).format(n);
}

function statusColor(s: string) {
  if (s === "SIGNED") return "text-green-700 bg-green-50";
  if (s === "NEGOTIATING") return "text-yellow-700 bg-yellow-50";
  if (s === "REJECTED") return "text-red-600 bg-red-50";
  return "text-muted-foreground bg-muted";
}

interface InvestorListResponse {
  data: Deal[];
  total: number;
  page: number;
  limit: number;
}

export function VerifiedDashboard({ business }: { business: MyBusiness }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublished, setIsPublished] = useState(business.isPublished);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    getToken()
      .then((token) => apiFetch<InvestorListResponse>(`/businesses/${business.id}/investors`, {}, token))
      .then((res) => setDeals(res.data ?? []))
      .catch(() => setDeals([]))
      .finally(() => setLoading(false));
  }, [business.id, getToken]);

  async function togglePublished() {
    setToggling(true);
    try {
      const token = await getToken();
      await apiFetch(`/businesses/${business.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished: !isPublished }),
      }, token);
      setIsPublished((p) => !p);
    } catch {
      // silently fail
    } finally {
      setToggling(false);
    }
  }

  const totalDeals = deals.length;
  const activeDeals = deals.filter((d) => ["NEGOTIATING", "SIGNED"].includes(d.deal.status)).length;
  const totalFunding = deals
    .filter((d) => d.deal.status === "SIGNED" && d.deal.investmentAmount)
    .reduce((s, d) => s + (d.deal.investmentAmount ?? 0), 0);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Image src={business.logoUrl ?? "/logo.svg"} alt="" width={44} height={44}
            className="rounded-xl border" unoptimized />
          <div>
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Verified
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isPublished ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                {isPublished ? "Live di marketplace" : "Tidak dipublish"}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2"
                disabled={toggling}
                onClick={togglePublished}
              >
                {toggling ? "..." : isPublished ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-1">
              <CardDescription>Total Investor</CardDescription>
              <CardTitle className="text-3xl">{loading ? "—" : totalDeals}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardDescription>Deal Aktif</CardDescription>
              <CardTitle className="text-3xl">{loading ? "—" : activeDeals}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardDescription>Funding Diterima</CardDescription>
              <CardTitle className="text-2xl">{loading ? "—" : fmt(totalFunding)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Business info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Info Bisnis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Industri</p>
              <p className="font-medium">{business.industry ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Stage</p>
              <p className="font-medium">{business.stage?.replace(/_/g, " ") ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Funding Ask</p>
              <p className="font-medium">{fmt(business.fundingAsk, business.fundingCurrency ?? "USD")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Tagline</p>
              <p className="font-medium">{business.tagline ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Investor table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Daftar Investor</h2>
            <Button size="sm" variant="outline"
              onClick={() => router.push(`/dashboard/ai-configuration?businessId=${business.id}`)}>
              Kelola AI Knowledge
            </Button>
          </div>
          <Card className="rounded-xl">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Memuat...</div>
            ) : deals.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Belum ada investor yang terhubung.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Investasi</TableHead>
                    <TableHead>Ekuitas</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((d) => (
                    <TableRow key={d.deal.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{d.investor.name}</p>
                        <p className="text-xs text-muted-foreground">{d.investor.email}</p>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(d.deal.status)}`}>
                          {d.deal.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {d.deal.investmentAmount ? fmt(d.deal.investmentAmount) : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {d.deal.equityPct != null ? `${d.deal.equityPct}%` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(d.deal.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
