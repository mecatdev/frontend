"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { getMyProfile, UserProfile } from "@/api/auth/profile";
import type { MyBusiness } from "@/api/v1/business/route";
import { getInvestorProfile, InvestorProfile } from "@/api/v1/investors/route";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number | null, currency = "USD") {
  if (amount == null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
  }).format(amount);
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right break-all ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export function ProfileView() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<MyBusiness | null>(null);
  const [investorData, setInvestorData] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        const dbProfile = await getMyProfile(token);
        setProfile(dbProfile);

        if (dbProfile.role === "FOUNDER") {
          apiFetch<MyBusiness>("/businesses/me", {}, token)
            .then(setBusiness)
            .catch(() => setBusiness(null));
        } else if (dbProfile.role === "INVESTOR") {
          getInvestorProfile(dbProfile.id, token)
            .then(setInvestorData)
            .catch(() => setInvestorData(null));
        }
      } catch {
        setError("Gagal memuat profil. Pastikan backend berjalan.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  async function handleLogout() {
    await signOut();
    router.replace("/auth/login");
  }

  const avatarSrc = clerkUser?.imageUrl ?? profile?.avatarUrl ?? null;
  const displayName = profile?.name ?? clerkUser?.fullName ?? "—";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Memuat profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
    );
  }

  return (
    <div className="py-8 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1">
                  <h1 className="text-xl font-bold">{displayName}</h1>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <Badge variant={profile?.role === "FOUNDER" ? "default" : "secondary"}>
                    {profile?.role ?? "—"}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="User ID (DB)" value={profile?.id ?? "—"} mono />
            <Separator />
            <Row label="Clerk ID" value={profile?.clerkId ?? "—"} mono />
            <Separator />
            <Row label="Email" value={profile?.email ?? "—"} />
            <Separator />
            <Row label="Role" value={profile?.role ?? "—"} />
            <Separator />
            <Row label="Bergabung" value={profile ? formatDate(profile.createdAt) : "—"} />
            <Separator />
            <Row label="Terakhir diperbarui" value={profile ? formatDate(profile.updatedAt) : "—"} />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{profile?._count.ownedBusinesses ?? 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Bisnis Dimiliki</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{profile?._count.investorDeals ?? 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Deal</p>
            </CardContent>
          </Card>
        </div>

        {/* FOUNDER: Business Info */}
        {profile?.role === "FOUNDER" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Bisnis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {business ? (
                <>
                  <Row label="Nama Bisnis" value={business.name} />
                  <Separator />
                  <Row label="Slug" value={`/business/${business.slug}`} mono />
                  <Separator />
                  <Row label="Industri" value={business.industry ?? "—"} />
                  <Separator />
                  <Row label="Stage" value={business.stage ?? "—"} />
                  <Separator />
                  <Row label="Funding Ask" value={formatCurrency(business.fundingAsk, business.fundingCurrency ?? "USD")} />
                  <Separator />
                  <Row
                    label="Status Verifikasi"
                    value={
                      <Badge variant={business.verificationStatus === "VERIFIED" ? "default" : business.verificationStatus === "PENDING" ? "secondary" : "outline"}>
                        {business.verificationStatus}
                      </Badge>
                    }
                  />
                  <Separator />
                  <Row label="Published" value={business.isPublished ? "Ya" : "Belum"} />
                  <Separator />
                  <Row label="Dibuat" value={formatDate(business.createdAt)} />
                  <div className="pt-2">
                    <Button size="sm" onClick={() => router.push("/dashboard")}>Ke Dashboard</Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">Belum ada bisnis terdaftar.</p>
                  <Button size="sm" onClick={() => router.push("/onboarding")}>Buat Bisnis</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* INVESTOR: Deal Info */}
        {profile?.role === "INVESTOR" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktivitas Investasi</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {investorData ? (
                <>
                  <div className="grid grid-cols-2 gap-4 pb-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{investorData.totalDeals}</p>
                      <p className="text-muted-foreground text-xs">Total Deal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{investorData.activeDeals}</p>
                      <p className="text-muted-foreground text-xs">Deal Aktif</p>
                    </div>
                  </div>
                  {investorData.deals.length > 0 && (
                    <>
                      <Separator />
                      <p className="font-medium">Riwayat Deal</p>
                      <div className="space-y-2">
                        {investorData.deals.map((deal) => (
                          <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="font-medium">{deal.business.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {deal.business.industry ?? "—"} · {formatDate(deal.createdAt)}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <Badge variant="outline">{deal.status}</Badge>
                              {deal.investmentAmount && (
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(deal.investmentAmount)} · {deal.equityPct}%
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="pt-2">
                    <Button size="sm" onClick={() => router.push("/home")}>Ke Marketplace</Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">Belum ada data investasi.</p>
                  <Button size="sm" onClick={() => router.push("/home")}>Jelajahi Bisnis</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}