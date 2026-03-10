"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Video, Handshake, DollarSign } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const stats = [
  {
    label: "Total Interviews",
    value: "24",
    change: "+3 this month",
    icon: Video,
  },
  {
    label: "Offers Accepted",
    value: "8",
    change: "+1 this month",
    icon: Handshake,
  },
  {
    label: "Total Investment",
    value: "$1.2M",
    change: "+$150K this month",
    icon: DollarSign,
  },
];

const roiData = [
  { month: "Jul", roi: 2.1 },
  { month: "Aug", roi: 3.4 },
  { month: "Sep", roi: 2.8 },
  { month: "Oct", roi: 5.1 },
  { month: "Nov", roi: 4.6 },
  { month: "Dec", roi: 6.2 },
  { month: "Jan", roi: 7.8 },
  { month: "Feb", roi: 8.5 },
  { month: "Mar", roi: 9.1 },
];

const chartConfig = {
  roi: {
    label: "ROI",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 px-10 py-8 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your investment activity overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-medium">
                {stat.label}
              </CardDescription>
              <stat.icon size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ROI Over Time</CardTitle>
          <CardDescription>
            Monthly return on investment (%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              data={roiData}
              margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${value}%`, "ROI"]}
                  />
                }
              />
              <defs>
                <linearGradient id="roiFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-roi)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-roi)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="roi"
                stroke="var(--color-roi)"
                strokeWidth={2}
                fill="url(#roiFill)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
