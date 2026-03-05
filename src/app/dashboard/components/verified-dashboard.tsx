"use client";

import { type MyBusiness } from "@/api/businesses";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function VerifiedDashboard({ business }: { business: MyBusiness }) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Image src="/logo.svg" alt="" width={40} height={40} />
          <div>
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Verified
            </span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Your business is {business.isPublished ? "live on the marketplace." : "not yet published."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle></CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
