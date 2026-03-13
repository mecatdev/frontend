"use client";

import { useEffect, useMemo, useState } from "react";
import { type MyBusiness } from "@/api/v1/business/route";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type InvestorDeal = {
  investor: { id: string; name: string; email: string; avatarUrl: string | null };
  deal: { id: string; status: string; createdAt: string };
};

const chartConfig = {
  deals: {
    label: "Deals",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function buildDailyDealsChartData(investors: InvestorDeal[], days = 14) {
  const toLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const perDayCount = new Map<string, number>();

  for (const item of investors) {
    const date = new Date(item.deal.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = toLocalDateKey(date);
    perDayCount.set(key, (perDayCount.get(key) ?? 0) + 1);
  }

  const points: Array<{ day: string; deals: number }> = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);
    currentDate.setDate(today.getDate() - i);
    const key = toLocalDateKey(currentDate);
    const label = currentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    points.push({
      day: label,
      deals: perDayCount.get(key) ?? 0,
    });
  }

  return points;
}

export function VerifiedDashboard({ business }: { business: MyBusiness }) {
  const [investors, setInvestors] = useState<InvestorDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<InvestorDeal[]>(`/businesses/${business.id}/investors`)
      .then(setInvestors)
      .catch(() => setInvestors([]))
      .finally(() => setLoading(false));
  }, [business.id]);

  const handleApprove = async (dealId: string) => {
    setApprovingId(dealId);
    try {
      await apiFetch(`/deals/${dealId}/approve`, { method: "PATCH" });
      setInvestors((prev) =>
        prev.map((item) =>
          item.deal.id === dealId
            ? { ...item, deal: { ...item.deal, status: "NEGOTIATING" } }
            : item,
        ),
      );
    } catch {
      // ignore
    } finally {
      setApprovingId(null);
    }
  };

  const draftCount = investors.filter((i) => i.deal.status === "DRAFT").length;
  const totalCount = investors.length;
  const chartData = useMemo(() => buildDailyDealsChartData(investors), [investors]);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Image src="/logo.svg" alt="" width={40} height={40} />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Verified
              </span>
              {business.scoredAt && (
                <span className="text-xs bg-background px-2 py-0.5 rounded-full font-medium">
                  AI score: {business.score}/100
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Your business is {business.isPublished ? "live on the marketplace." : "not yet published."}
        </p>
        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Deals Incoming</CardTitle>
              <CardDescription>Requests from investors who chose to make an offer.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">{draftCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Listed</CardTitle>
              <CardDescription>Total investors interested.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">{totalCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Growth</CardTitle>
              <CardDescription>Deals over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">+{totalCount > 0 ? Math.round((draftCount / totalCount) * 100) : 0}%</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Deals per Day</CardTitle>
            <CardDescription>Daily count of new deal requests from investors in the last 14 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full">
              <LineChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval="preserveStartEnd"
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="deals"
                  dot={false}
                  stroke="var(--color-deals)"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="flex gap-4 items-center justify-between pt-8">
          <h1 className="text-lg font-semibold">Your investors list</h1>
        </div>

        <Card className="rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Investor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : investors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                    No investors yet.
                  </TableCell>
                </TableRow>
              ) : (
                investors.map((item, idx) => (
                  <TableRow key={item.deal.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{item.investor.name}</p>
                        <p className="text-xs text-muted-foreground">{item.investor.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.deal.status === "DRAFT" ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {item.deal.status === "DRAFT" ? "Requested" : item.deal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.deal.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          disabled={approvingId === item.deal.id}
                          onClick={() => handleApprove(item.deal.id)}
                        >
                          {approvingId === item.deal.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check size={12} />
                          )}
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}