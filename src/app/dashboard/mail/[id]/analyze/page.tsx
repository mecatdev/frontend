"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Download,
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

type DocumentContent = {
  name: string;
  type: "message" | "text" | "binary";
  text?: string;
  url?: string;
  mimeType?: string;
};

function resolveUrl(url: string): string {
  // Already absolute
  if (url.startsWith("http")) return url;
  return url;
}

async function tryFetchText(url: string): Promise<string | null> {
  const target = url.startsWith("http") ? url : url;
  try {
    const res = await fetch(target);
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

async function downloadBlob(url: string, filename: string) {
  try {
    const res = await fetch(resolveUrl(url));
    if (!res.ok) return;
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(resolveUrl(url), "_blank");
  }
}

const SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;

const SEVERITY_LINE_STYLE: Record<string, string> = {
  critical: "bg-red-50 border-l-[3px] border-red-500 pl-2",
  high: "bg-orange-50 border-l-[3px] border-orange-500 pl-2",
  medium: "bg-yellow-50 border-l-[3px] border-yellow-400 pl-2",
  low: "bg-green-50 border-l-[3px] border-green-500 pl-2",
};

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-red-400",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
  low: "bg-green-400",
};

function getLineSeverity(line: string, risks: RiskItem[]): string | null {
  const lower = line.toLowerCase();
  let bestIdx = Infinity;
  for (const risk of risks) {
    const words = risk.clause.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) continue;
    const matched = words.filter((w) => lower.includes(w)).length;
    if (matched >= Math.max(1, Math.ceil(words.length * 0.5))) {
      const idx = SEVERITY_ORDER.indexOf(
        risk.severity as (typeof SEVERITY_ORDER)[number],
      );
      if (idx < bestIdx) bestIdx = idx;
    }
  }
  return bestIdx < Infinity ? SEVERITY_ORDER[bestIdx] : null;
}

function HighlightedText({
  text,
  risks,
}: {
  text: string;
  risks: RiskItem[];
}) {
  const lines = text.split("\n");
  return (
    <div className="text-xs font-mono leading-5 space-y-px">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        const severity = getLineSeverity(line, risks);
        return (
          <div
            key={i}
            className={cn(
              "px-2 py-0.5 rounded-sm whitespace-pre-wrap break-all",
              severity ? SEVERITY_LINE_STYLE[severity] : "hover:bg-muted/20",
            )}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
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
  const [docContents, setDocContents] = useState<DocumentContent[]>([]);
  const [activeDoc, setActiveDoc] = useState(0);

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
      const docs: DocumentContent[] = [];

      // Add investor message bodies as document content
      for (const msg of investorMessages) {
        if (msg.body.trim()) {
          docs.push({
            name: `Message from ${msg.sender.name}`,
            type: "message",
            text: msg.body.trim(),
          });
        }
      }

      for (const att of attachments) {
        const text = await tryFetchText(att.url);
        if (text) {
          parts.push(`--- Attachment: ${att.name} ---\n${text.slice(0, 20000)}`);
          fileNames.push(att.name);
          docs.push({ name: att.name, type: "text", text: text.slice(0, 20000) });
        } else {
          // Include file name as context even if we can't read content
          parts.push(`--- Attachment: ${att.name} (${att.type}, binary file) ---`);
          fileNames.push(att.name);
          docs.push({
            name: att.name,
            type: "binary",
            url: att.url,
            mimeType: att.type,
          });
        }
      }

      setAnalyzedFiles(fileNames);
      setDocContents(docs);

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
            attachments: attachments.map((att) => ({
              name: att.name,
              url: att.url,
              type: att.type,
            })),
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
    <div className="min-h-screen bg-white">
      {/* Top header bar */}
      <div className="sticky top-0 z-10 bg-white backdrop-blur border-b px-6 py-3 flex items-center gap-4">
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

      {/* Loading / Error — full width */}
      {(status === "loading-mail" || status === "loading-analysis") && (
        <div className="flex items-center justify-center py-32">
          <Card className="w-full max-w-md mx-8">
            <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 size={22} className="animate-spin text-primary" />
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
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center justify-center py-32">
          <Card className="w-full max-w-md mx-8">
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
        </div>
      )}

      {/* Two-column results layout */}
      {status === "done" && result && (
        <div className="flex gap-0 h-[calc(100vh-57px)]">

          {/* ── LEFT: Document Preview ── */}
          <div className="w-1/2 border-r bg-white flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-primary" />
                <span className="text-sm font-semibold">Document Preview</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Lines matching detected risks are highlighted.
              </p>
            </div>

            {/* Doc selector tabs */}
            {docContents.length > 1 && (
              <div className="flex gap-1.5 flex-wrap px-4 py-2.5 border-b bg-white shrink-0">
                {docContents.map((doc, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDoc(i)}
                    className={cn(
                      "text-[11px] px-2.5 py-1 rounded-full border transition-colors truncate max-w-[160px]",
                      activeDoc === i
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-muted/60",
                    )}
                    title={doc.name}
                  >
                    {doc.name}
                  </button>
                ))}
              </div>
            )}

            {/* Viewer */}
            <div className="flex-1 overflow-y-auto">
              {(() => {
                const doc = docContents[activeDoc];
                if (!doc) return (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No document selected
                  </div>
                );

                if (doc.type === "binary") {
                  const fileUrl = resolveUrl(doc.url ?? "");
                  const isPdf =
                    doc.mimeType?.includes("pdf") || doc.name.endsWith(".pdf");

                  if (isPdf) {
                    return (
                      <iframe
                        src={fileUrl}
                        className="w-full h-full border-0"
                        title={doc.name}
                      />
                    );
                  }
                  return (
                    <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
                      <FileText size={40} className="text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground text-center">
                        Preview not available for <span className="font-medium">{doc.name}</span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => downloadBlob(doc.url ?? "", doc.name)}
                      >
                        <Download size={13} />
                        Download file
                      </Button>
                    </div>
                  );
                }

                // text / message
                return (
                  <div className="p-4">
                    <HighlightedText
                      text={doc.text ?? ""}
                      risks={result.risks ?? []}
                    />
                  </div>
                );
              })()}
            </div>

            {/* Legend */}
            {result.risks && result.risks.length > 0 && (
              <div className="px-4 py-2.5 border-t bg-white shrink-0 flex items-center gap-3 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Highlights:</span>
                {SEVERITY_ORDER.filter((sev) =>
                  result.risks!.some((r) => r.severity === sev),
                ).map((sev) => (
                  <div key={sev} className="flex items-center gap-1">
                    <div className={cn("w-2.5 h-2.5 rounded-sm", SEVERITY_DOT[sev])} />
                    <span className="text-[10px] text-muted-foreground capitalize">{sev}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Analysis Results ── */}
          <div className="w-1/2 overflow-y-auto bg-white">
            <div className="p-5 space-y-5 pb-12">

              {/* Summary stat cards */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardDescription className="text-[11px]">Total Risks</CardDescription>
                    <CardTitle className="text-2xl">{totalRisks}</CardTitle>
                  </CardHeader>
                </Card>
                <Card className={criticalCount > 0 ? "border-red-200" : ""}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardDescription className="text-[11px]">Critical</CardDescription>
                    <CardTitle className={cn("text-2xl", criticalCount > 0 ? "text-red-600" : "")}>
                      {criticalCount}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className={highCount > 0 ? "border-orange-200" : ""}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardDescription className="text-[11px]">High</CardDescription>
                    <CardTitle className={cn("text-2xl", highCount > 0 ? "text-orange-600" : "")}>
                      {highCount}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Risk Assessment summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldAlert size={15} className="text-primary" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-[13px] leading-relaxed text-foreground/80">
                    {result.riskFeedback}
                  </p>
                </CardContent>
              </Card>

              {/* Identified Risks list */}
              {result.risks && result.risks.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle size={15} className="text-primary" />
                      Identified Risks
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      Specific clauses flagged during analysis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5 pt-0">
                    {result.risks.map((risk, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => {
                          // scroll to highlight: find the first doc that has text
                          const docIdx = docContents.findIndex(
                            (d) => d.type !== "binary"
                          );
                          if (docIdx >= 0) setActiveDoc(docIdx);
                        }}
                      >
                        <SeverityIcon severity={risk.severity} />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-medium">{risk.clause}</span>
                            <SeverityBadge severity={risk.severity} />
                          </div>
                          <p className="text-[12px] text-muted-foreground leading-relaxed">
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <HelpCircle size={15} className="text-primary" />
                      Questions to Ask
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      Clarify these with the investor before proceeding.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ol className="space-y-2.5">
                      {result.recommendedQuestions.map((q, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-[13px] text-foreground/80 leading-relaxed">{q}</p>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {/* Analyzed files footer */}
              {analyzedFiles.length > 0 && (
                <Card className="bg-white border-dashed">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FileText size={12} className="text-muted-foreground shrink-0" />
                      <span className="text-[11px] text-muted-foreground">Analyzed:</span>
                      {analyzedFiles.map((f) => (
                        <span key={f} className="text-[10px] bg-background border px-2 py-0.5 rounded-full text-muted-foreground">
                          {f}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
