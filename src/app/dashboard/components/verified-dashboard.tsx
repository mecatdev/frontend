"use client";

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
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const chartData = [
  { month: "January", investors: 4 },
  { month: "February", investors: 6 },
  { month: "March", investors: 3 },
  { month: "April", investors: 5 },
  { month: "Mei", investors: 8 },
  { month: "June", investors: 9 },
  { month: "July", investors: 11 },
  { month: "August", investors: 12 },
  { month: "September", investors: 14 },
  { month: "October", investors: 12 },
  { month: "Desember", investors: 16 },
]

const chartConfig = {
  investors: {
    label: "Deals",
    color: "hsl(var(--primary))",
  }
} satisfies ChartConfig;

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
        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Deals Incoming</CardTitle>
              <CardDescription>Checkout on your incoming deals from investor.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                {/* TODO:fetch recent deals */}
                <p className="text-2xl">2</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Listed</CardTitle>
              <CardDescription>Check out your listed investors interested on your business.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                {/* TODO: fetch listed investors */}
                <p className="text-2xl">5</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Growth</CardTitle>
              <CardDescription>Your business growth metrics. Based on deals overtime.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                {/* TODO: fetch growth metrics */}
                <p className="text-2xl">+25%</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card> 
          <CardHeader>
            <CardTitle>Your Business Investors Growth</CardTitle>
            <CardDescription>Track the growth of your business investors over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="w-full"
            >
              <LineChart
                accessibilityLayer
                data={chartData}
              >
                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  tickFormatter={(value) => value.slice(0, 3)}
                />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />

                <Line
                  type="monotone"
                  dataKey="investors"
                  dot={false}
                  stroke="var(--color-investors)"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <div className="flex gap-4 items-center justify-between pt-8">
          <h1 className="text-lg font-semibold">Your investors list</h1>
          <Button
          >
            View all investors
          </Button>
        </div>
        <Card className="rounded-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Investor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>John Doe</TableCell>
                <TableCell>Requested</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-semibold text-foreground">Total</TableCell>
                <TableCell>1</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Card>
      </div>
    </div>
  );
}
