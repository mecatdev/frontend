import { NextRequest, NextResponse } from "next/server";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function getCandidateBackendBases(): string[] {
  const candidates = [
    process.env.BACKEND_URL,
    "http://host.docker.internal:4000",
    "http://mecat-backend:4000",
    "http://backend:4000",
    "http://localhost:4000",
  ].filter(Boolean) as string[];

  const normalized = candidates.map((c) => normalizeBaseUrl(c));
  return [...new Set(normalized)];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const filePath = path.join("/");
  const fetchHeaders: HeadersInit = {};
  const range = request.headers.get("Range");
  if (range) fetchHeaders["Range"] = range;

  const candidateBases = getCandidateBackendBases();
  const fetchErrors: string[] = [];

  for (const base of candidateBases) {
    const backendUrl = `${base}/uploads/${filePath}`;
    try {
      const upstream = await fetch(backendUrl, { headers: fetchHeaders });

      if (!upstream.ok) {
        fetchErrors.push(`${backendUrl} -> HTTP ${upstream.status}`);
        continue;
      }

      const headers = new Headers();
      const ct = upstream.headers.get("content-type");
      const cl = upstream.headers.get("content-length");
      const cr = upstream.headers.get("content-range");
      if (ct) headers.set("content-type", ct);
      if (cl) headers.set("content-length", cl);
      if (cr) headers.set("content-range", cr);
      // Allow inline viewing in iframes (important for PDF)
      headers.set(
        "content-disposition",
        `inline; filename="${filePath.split("/").pop() ?? "file"}"`,
      );

      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      fetchErrors.push(`${backendUrl} -> ${msg}`);
    }
  }

  console.error("[uploads proxy] Failed all backend candidates", {
    filePath,
    candidates: candidateBases,
    errors: fetchErrors,
  });
  return new NextResponse("Failed to fetch file from backend", {
    status: 502,
  });
}
