"use client";

import type { MyBusiness } from "@/api/v1/business/route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

function formatCurrency(amount: number | null, currency = "USD") {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
  }).format(amount);
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function PendingDashboard({ business }: { business: MyBusiness }) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Image src="/logo.svg" alt="" width={40} height={40} />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">
              Under Review
            </Badge>
          </div>
        </div>

        {/* Status card */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-5 space-y-1">
            <p className="font-semibold text-yellow-800">Bisnis kamu sedang dalam proses review</p>
            <p className="text-sm text-yellow-700">
              Tim kami sedang memverifikasi data bisnis kamu. Kamu akan mendapat notifikasi
              setelah proses review selesai. Biasanya membutuhkan 1–3 hari kerja.
            </p>
          </CardContent>
        </Card>

        {/* Business details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Bisnis yang Disubmit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Nama" value={business.name} />
            <Separator />
            <Row
              label="Tagline"
              value={business.tagline ?? <span className="text-muted-foreground">—</span>}
            />
            <Separator />
            <Row
              label="Industri"
              value={business.industry ?? <span className="text-muted-foreground">—</span>}
            />
            <Separator />
            <Row
              label="Stage"
              value={
                business.stage ? (
                  <Badge variant="outline">{business.stage.replace("_", " ")}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )
              }
            />
            <Separator />
            <Row
              label="Funding Ask"
              value={formatCurrency(business.fundingAsk, business.fundingCurrency ?? "USD")}
            />
            <Separator />
            <Row
              label="Published di Marketplace"
              value={business.isPublished ? "Ya" : "Belum (setelah verified)"}
            />
            <Separator />
            <Row
              label="Disubmit pada"
              value={new Date(business.updatedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proses Verifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm">
              <Step done label="Onboarding selesai" desc="Data awal bisnis telah disimpan." />
              <Step done label="Formulir verifikasi disubmit" desc="Kamu sudah mengisi dan mengirim data verifikasi." />
              <Step active label="Review oleh tim Mecat" desc="Sedang diproses, harap menunggu." />
              <Step label="Bisnis tayang di marketplace" desc="Akan otomatis aktif setelah verified." />
            </ol>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function Step({
  label,
  desc,
  done = false,
  active = false,
}: {
  label: string;
  desc: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <li className="flex gap-3 items-start">
      <div
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
          ${done ? "bg-green-500 text-white" : active ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-400"}`}
      >
        {done ? "✓" : "•"}
      </div>
      <div>
        <p className={`font-medium ${active ? "text-yellow-700" : done ? "" : "text-muted-foreground"}`}>
          {label}
        </p>
        <p className="text-muted-foreground text-xs">{desc}</p>
      </div>
    </li>
  );
}
