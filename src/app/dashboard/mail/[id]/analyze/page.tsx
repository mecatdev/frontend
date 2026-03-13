"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Mail, Attachment } from "@/components/mail";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FileText,
  HelpCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RiskItem = {
  severity: "low" | "medium" | "high" | "critical";
  clause: string;
  description: string;
};

type AnalysisResult = {
  riskFeedback: string;
  recommendedQuestions: string[];
  risks?: RiskItem[];
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:4000";

function resolveUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
}

async function tryFetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(resolveUrl(url));
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok) return null;
    if (
      ct.includes("text") ||
      url.endsWith(".txt") ||
      url.endsWith(".md") ||
      url.endsWith(".csv")
    ) {
      return await res.text();
    }
    return null;
  } catch {
    return null;
  }
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border",
        map[severity] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      {severity}
    </span>
  );
}

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical" || severity === "high") {
    return <ShieldAlert size={15} className="text-red-500 shrink-0 mt-0.5" />;
  }
  if (severity === "medium") {
    return <AlertTriangle size={15} className="text-yellow-500 shrink-0 mt-0.5" />;
  }
  return <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />;
}

export default function AnalyzePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [status, setStatus] = useState<
    "loading-mail" | "loading-analysis" | "done" | "error"
  >("loading-mail");
  const [statusMsg, setStatusMsg] = useState("Loading conversation...");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [mail, setMail] = useState<Mail | null>(null);
  const [analyzedFiles, setAnalyzedFiles] = useState<string[]>([]);

  useEffect(() => {
    async function run() {
      // 1. Fetch the mail thread
      let thread: Mail;
      try {
        thread = await apiFetch<Mail>(`/mails/${id}`);
        setMail(thread);
      } catch {
        setStatus("error");
        setStatusMsg("Failed to load conversation. Please go back and try again.");
        return;
      }

      // 2. Determine current user (recipient of the original mail = founder)
      const currentUserId = thread.recipient.id;

      // 3. Collect all messages from the investor (non-current-user)
      const allMessages = [thread, ...(thread.replies ?? [])];
      const investorMessages = allMessages.filter(
        (m) => m.sender.id !== currentUserId,
      );

      if (investorMessages.length === 0) {
        setStatus("error");
        setStatusMsg("No investor messages found to analyze.");
        return;
      }

      setStatus("loading-analysis");
      setStatusMsg("Extracting document content...");

      // 4. Build contractText from bodies + attachment contents
      const parts: string[] = [];

      // Collect investor message bodies
      for (const msg of investorMessages) {
        if (msg.body.trim()) {
          parts.push(`--- Message from ${msg.sender.name} ---\n${msg.body.trim()}`);
        }
      }

      // Try to fetch text from attachments
      const attachments: Attachment[] = investorMessages.flatMap(
        (m) => (m.attachments ?? []) as Attachment[],
      );
      const fileNames: string[] = [];
      for (const att of attachments) {
        const text = await tryFetchText(att.url);
        if (text) {
          parts.push(`--- Attachment: ${att.name} ---\n${text.slice(0, 20000)}`);
          fileNames.push(att.name);
        } else {
          // Include file name as context even if we can't read content
          parts.push(`--- Attachment: ${att.name} (${att.type}, binary file) ---`);
          fileNames.push(att.name);
        }
      }

      setAnalyzedFiles(fileNames);

      const contractText = parts.join("\n\n");
      if (!contractText.trim()) {
        setStatus("error");
        setStatusMsg("No analyzable content found in this conversation.");
        return;
      }

      setStatusMsg("Running AI legal analysis...");

      // 5. Call the analyze endpoint
      try {
        const data = await apiFetch<AnalysisResult>("/legal/analyze", {
          method: "POST",
          body: JSON.stringify({
            contractText: contractText.slice(0, 80000),
            businessId: thread.business.id,
          }),
        });
        setResult(data);
        setStatus("done");
      } catch {
        setStatus("error");
        setStatusMsg("Analysis failed. The AI service may be unavailable. Please try again.");
      }
    }

    run();
  }, [id]); // eslint-disable-line

  const criticalCount =
    result?.risks?.filter((r) => r.severity === "critical").length ?? 0;
  const highCount =
    result?.risks?.filter((r) => r.severity === "high").length ?? 0;
  const totalRisks = result?.risks?.length ?? 0;

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Back
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-primary" />
            <h1 className="text-lg font-semibold">Document Risk Analysis</h1>
          </div>
          {mail && (
            <Badge variant="secondary" className="text-[11px] ml-auto">
              {mail.business.name}
            </Badge>
          )}
        </div>

        {/* Loading state */}
        {(status === "loading-mail" || status === "loading-analysis") && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-primary" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">{statusMsg}</p>
                <p className="text-xs text-muted-foreground">
                  {status === "loading-analysis"
                    ? "This may take a few moments depending on document length."
                    : "Please wait..."}
                </p>
              </div>
              {status === "loading-analysis" && analyzedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  {analyzedFiles.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
                    >
                      <FileText size={10} />
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {status === "error" && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle size={22} className="text-destructive" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-destructive">Analysis failed</p>
                <p className="text-xs text-muted-foreground max-w-xs">{statusMsg}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mt-2 gap-1.5"
              >
                <ArrowLeft size={13} />
                Go back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {status === "done" && result && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardDescription className="text-xs">Total Risks</CardDescription>
                  <CardTitle className="text-2xl">{totalRisks}</CardTitle>
                </CardHeader>
              </Card>
              <Card className={criticalCount > 0 ? "border-red-200" : ""}>
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardDescription className="text-xs">Critical</CardDescription>
                  <CardTitle
                    className={cn(
                      "text-2xl",
                      criticalCount > 0 ? "text-red-600" : "text-foreground",
                    )}
                  >
                    {criticalCount}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className={highCount > 0 ? "border-orange-200" : ""}>
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardDescription className="text-xs">High Severity</CardDescription>
                  <CardTitle
                    className={cn(
                      "text-2xl",
                      highCount > 0 ? "text-orange-600" : "text-foreground",
                    )}
                  >
                    {highCount}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Risk Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert size={16} className="text-primary" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>
                  AI-generated summary of the legal and commercial risks found.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {result.riskFeedback}
                </p>
              </CardContent>
            </Card>

            {/* Risk Items */}
            {result.risks && result.risks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle size={16} className="text-primary" />
                    Identified Risks
                  </CardTitle>
                  <CardDescription>
                    Specific clauses and issues flagged during analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {result.risks.map((risk, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <SeverityIcon severity={risk.severity} />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{risk.clause}</span>
                          <SeverityBadge severity={risk.severity} />
                        </div>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">
                          {risk.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommended Questions */}
            {result.recommendedQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle size={16} className="text-primary" />
                    Recommended Questions to Ask
                  </CardTitle>
                  <CardDescription>
                    Questions you should clarify with the investor before proceeding.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ol className="space-y-2.5">
                    {result.recommendedQuestions.map((q, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground/80 leading-relaxed">{q}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Analyzed files footer */}
            {analyzedFiles.length > 0 && (
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-4 px-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FileText size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      Analyzed files:
                    </span>
                    {analyzedFiles.map((f) => (
                      <span
                        key={f}
                        className="text-[11px] bg-background border px-2 py-0.5 rounded-full text-muted-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bottom back button */}
            <div className="flex justify-start pb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="gap-1.5"
              >
                <ArrowLeft size={13} />
                Back to Inbox
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
