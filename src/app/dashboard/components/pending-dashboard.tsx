import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { BusinessScore, MyBusiness } from "@/api/v1/business/route";
import { getMyBusiness } from "@/api/v1/business/route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Props = {
  business: MyBusiness;
  isOwner?: boolean;
  onResolved?: (business: MyBusiness) => void | Promise<void>;
  verifiedRedirectPath?: string;
  retryRedirectPath?: string;
};

export function PendingDashboard({
  business,
  isOwner = false,
  onResolved,
  verifiedRedirectPath = "/dashboard",
  retryRedirectPath = "/dashboard",
}: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState<MyBusiness>(business);
  const [checking, setChecking] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);

  useEffect(() => {
    setCurrent(business);
  }, [business]);

  const hasMetrics = (current.scores?.length ?? 0) > 0;
  const isResolved = current.verificationStatus !== "PENDING";

  useEffect(() => {
    if (!isOwner || isResolved) return;

    setChecking(true);
    setPollError(null);

    let attempts = 0;
    let stopped = false;
    const maxAttempts = 12;

    const interval = setInterval(() => {
      attempts += 1;

      getMyBusiness()
        .then((nextBusiness) => {
          if (stopped) return;

          setCurrent(nextBusiness);

          if (nextBusiness.verificationStatus !== "PENDING") {
            setChecking(false);
            stopped = true;
            clearInterval(interval);
            void onResolved?.(nextBusiness);
            return;
          }

          if ((nextBusiness.scores?.length ?? 0) > 0) {
            setChecking(false);
            stopped = true;
            clearInterval(interval);
          }
        })
        .catch(() => {
          console.error("[PendingDashboard] failed to refresh business after verification");
        });

      if (attempts >= maxAttempts) {
        setChecking(false);
        setPollError("AI analysis is taking longer than expected or failed. You can refresh this page later.");
        console.error("[PendingDashboard] giving up waiting for AI verification scoring");
        stopped = true;
        clearInterval(interval);
      }
    }, 5000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [isOwner, isResolved, onResolved]);

  const metrics = useMemo(() => normalizeScores(current.scores ?? []), [current.scores]);
  const overall = metrics.length > 0 ? current.score : null;

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{current.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border">AI verification</Badge>
              {checking && (
                <Badge variant="outline" className="gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  refreshing
                </Badge>
              )}
            </div>
          </div>
        </div>

        {!hasMetrics && <PendingState checking={checking} error={pollError} />}

        {hasMetrics && (
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Verification scoring</CardTitle>
              <CardDescription>
                {current.verificationStatus === "REJECTED"
                  ? "The current submission needs improvement before it can be approved."
                  : "Your latest AI review is ready."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {overall != null && (
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Overall readiness score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-semibold tracking-tight">{overall}</span>
                      <span className="text-sm text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <Badge variant={current.verificationStatus === "REJECTED" ? "destructive" : "default"}>
                    {current.verificationStatus === "REJECTED" ? "Requires resubmission" : "Review completed"}
                  </Badge>
                </div>
              )}

              {current.scoredAt && (
                <p className="text-xs text-muted-foreground">
                  scored at {new Date(current.scoredAt).toLocaleString()}
                </p>
              )}

              {pollError && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {pollError}
                </p>
              )}

              <Separator />

              <div className="space-y-3">
                {metrics.map((metric) => (
                  <MetricRow key={metric.category} metric={metric} />
                ))}
              </div>

              {current.verificationStatus !== "PENDING" && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {current.verificationStatus === "VERIFIED" ? (
                    <Button onClick={() => window.location.assign(verifiedRedirectPath)}>
                      Open verified dashboard
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => window.location.assign(retryRedirectPath)}>
                      Return to verification form
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => router.refresh()}>
                    Refresh status
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PendingState({ checking, error }: { checking: boolean; error: string | null }) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Analyzing your submission</CardTitle>
        <CardDescription>
          Mecat is reviewing your business profile and calculating the verification score.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-40 animate-pulse rounded-full bg-muted" />
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/80">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-foreground/10" />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          {error
            ? error
            : checking
              ? "Fetching the latest scoring result from the server."
              : "Starting AI analysis. This usually finishes within a few seconds."}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({ metric }: { metric: NormalizedMetric }) {
  const pct = metric.maxScore > 0 ? (metric.score / metric.maxScore) * 100 : 0;

  return (
    <div className="space-y-2 rounded-xl border border-border/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{metric.label}</p>
        <span className="text-xs text-muted-foreground">
          {metric.score} / {metric.maxScore}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{metric.reason}</p>
    </div>
  );
}

type NormalizedMetric = {
  category: string;
  label: string;
  score: number;
  maxScore: number;
  reason: string;
};

function normalizeScores(scores: BusinessScore[]): NormalizedMetric[] {
  return scores.map((s) => ({
    category: s.category,
    label: s.metadata?.label ?? prettyLabelFromCategory(s.category),
    score: s.score,
    maxScore: s.maxScore,
    reason: (s.metadata?.reason as string | undefined) ?? "",
  }));
}

function prettyLabelFromCategory(category: string): string {
  switch (category) {
    case "team_experience":
      return "Team Experience";
    case "problem_clarity":
      return "Problem & Solution Clarity";
    case "market_readiness":
      return "Market Readiness";
    case "business_model_clarity":
      return "Business Model Clarity";
    case "funding_ask_fit":
      return "Funding Ask Fit";
    default:
      return category.replace(/_/g, " ");
  }
}