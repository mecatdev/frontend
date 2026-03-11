"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { getMyBusinesses } from "@/api/v1/business/route";
import type { MyBusiness } from "@/api/v1/business/route";
import {
  listKnowledgeChunks,
  uploadKnowledgeFile,
  deleteKnowledgeChunk,
  type KnowledgeChunk,
} from "@/api/v1/knowledge/route";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const PROMPT_KEY = "ai_system_prompt";

function groupBySource(chunks: KnowledgeChunk[]) {
  const map = new Map<string, KnowledgeChunk[]>();
  for (const chunk of chunks) {
    const key = chunk.sourceLabel ?? "Untitled";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(chunk);
  }
  return map;
}

export default function AIConfigurationPage() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const urlBusinessId = searchParams.get("businessId");

  // ── Business selector ──────────────────────────────────────────────────────
  const [businesses, setBusinesses] = useState<MyBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(urlBusinessId);

  useEffect(() => {
    getToken().then((token) => getMyBusinesses(token)).then(setBusinesses).catch(() => {});
  }, [getToken]);

  // If URL param changes (e.g. navigation), sync state
  useEffect(() => {
    if (urlBusinessId) setSelectedBusinessId(urlBusinessId);
  }, [urlBusinessId]);

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId) ?? null;

  // ── System Prompt ──────────────────────────────────────────────────────────
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant representing this business. Answer investor questions accurately and professionally based on the provided knowledge."
  );
  const [promptSaved, setPromptSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(PROMPT_KEY);
    if (saved) setSystemPrompt(saved);
  }, []);

  function savePrompt() {
    localStorage.setItem(PROMPT_KEY, systemPrompt);
    setPromptSaved(true);
    setTimeout(() => setPromptSaved(false), 2000);
  }

  // ── Knowledge Chunks ───────────────────────────────────────────────────────
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // ── Upload mode ────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<"file" | "text">("file");

  // File upload
  const [file, setFile] = useState<File | null>(null);
  const [fileLabel, setFileLabel] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text input
  const [textContent, setTextContent] = useState("");
  const [textLabel, setTextLabel] = useState("");
  const [addingText, setAddingText] = useState(false);

  // Shared upload state
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function loadChunks(businessId: string) {
    setLoadingChunks(true);
    try {
      const token = await getToken();
      const data = await listKnowledgeChunks(businessId, token);
      setChunks(data);
    } catch {
      // silently fail
    } finally {
      setLoadingChunks(false);
    }
  }

  useEffect(() => {
    if (selectedBusinessId) {
      setChunks([]);
      loadChunks(selectedBusinessId);
    }
  }, [selectedBusinessId]); // eslint-disable-line

  // ── Upload file ────────────────────────────────────────────────────────────
  async function handleUploadFile() {
    if (!file || !selectedBusinessId) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const token = await getToken();
      const label = fileLabel.trim() || file.name;
      const result = await uploadKnowledgeFile(selectedBusinessId, file, label, token);
      setUploadMsg({ type: "ok", text: `Berhasil: ${result.chunksCreated} chunk dari "${label}"` });
      setFile(null);
      setFileLabel("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadChunks(selectedBusinessId);
    } catch (e) {
      setUploadMsg({ type: "err", text: e instanceof Error ? e.message : "Upload gagal" });
    } finally {
      setUploading(false);
    }
  }

  // ── Upload text ────────────────────────────────────────────────────────────
  async function handleAddText() {
    if (!textContent.trim() || !selectedBusinessId) return;
    setAddingText(true);
    setUploadMsg(null);
    try {
      const token = await getToken();
      const label = textLabel.trim() || "Manual Input";
      await apiFetch(
        `/knowledge/${selectedBusinessId}/chunks`,
        {
          method: "POST",
          body: JSON.stringify({ content: textContent.trim(), sourceLabel: label }),
        },
        token
      );
      setUploadMsg({ type: "ok", text: `Berhasil ditambahkan ke "${label}"` });
      setTextContent("");
      setTextLabel("");
      await loadChunks(selectedBusinessId);
    } catch (e) {
      setUploadMsg({ type: "err", text: e instanceof Error ? e.message : "Gagal menambahkan teks" });
    } finally {
      setAddingText(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(chunkId: string) {
    if (!selectedBusinessId) return;
    setDeletingIds((prev) => new Set(prev).add(chunkId));
    try {
      const token = await getToken();
      await deleteKnowledgeChunk(selectedBusinessId, chunkId, token);
      setChunks((prev) => prev.filter((c) => c.id !== chunkId));
    } catch {
      // silently fail
    } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(chunkId); return next; });
    }
  }

  async function handleDeleteSource(label: string) {
    const toDelete = chunks.filter((c) => (c.sourceLabel ?? "Untitled") === label);
    await Promise.all(toDelete.map((c) => handleDelete(c.id)));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === "application/pdf" || dropped.name.endsWith(".txt"))) {
      setFile(dropped);
    }
  }

  const grouped = groupBySource(chunks);
  const totalTokens = chunks.reduce((s, c) => s + c.tokenCount, 0);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">AI Configuration</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Konfigurasi AI voice assistant bisnismu untuk menjawab pertanyaan investor.
          </p>
        </div>

        {/* Business Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Business</CardTitle>
            <CardDescription>Choose which business to manage AI knowledge for.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedBusinessId ?? ""}
              onValueChange={(val) => setSelectedBusinessId(val)}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select a business..." />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {!selectedBusiness ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Select a business above to manage its AI knowledge.</p>
          </div>
        ) : (
          <>
            {/* System Prompt */}
            <Card>
              <CardHeader>
                <CardTitle>System Prompt</CardTitle>
                <CardDescription>
                  Tentukan cara AI assistant merespons investor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="resize-none rounded-xl"
                  placeholder="Describe how the AI should behave..."
                />
                <div className="flex items-center justify-end gap-3">
                  {promptSaved && (
                    <span className="text-sm text-green-600">Tersimpan!</span>
                  )}
                  <Button onClick={savePrompt}>Simpan Prompt</Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Knowledge */}
            <Card>
              <CardHeader>
                <CardTitle>Tambah Knowledge</CardTitle>
                <CardDescription>
                  Upload PDF/TXT atau ketik langsung teks yang ingin dijadikan pengetahuan AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode toggle */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={mode === "file" ? "default" : "outline"}
                    onClick={() => { setMode("file"); setUploadMsg(null); }}
                  >
                    Upload File
                  </Button>
                  <Button
                    size="sm"
                    variant={mode === "text" ? "default" : "outline"}
                    onClick={() => { setMode("text"); setUploadMsg(null); }}
                  >
                    Input Teks
                  </Button>
                </div>

                {mode === "file" && (
                  <>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                        ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                      {file ? (
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                          <button
                            className="text-xs text-red-500 hover:underline"
                            onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Drag & drop, atau <span className="text-primary font-medium">klik untuk browse</span>
                          </p>
                          <p className="text-xs text-muted-foreground">PDF atau TXT · maks. 10 MB</p>
                        </div>
                      )}
                    </div>
                    <Input
                      placeholder="Label sumber (opsional, contoh: Pitch Deck)"
                      className="h-11 rounded-xl"
                      value={fileLabel}
                      onChange={(e) => setFileLabel(e.target.value)}
                    />
                  </>
                )}

                {mode === "text" && (
                  <>
                    <Input
                      placeholder="Label sumber (contoh: Company Overview)"
                      className="h-11 rounded-xl"
                      value={textLabel}
                      onChange={(e) => setTextLabel(e.target.value)}
                    />
                    <Textarea
                      placeholder="Tulis atau paste konten knowledge di sini..."
                      className="resize-none rounded-xl"
                      rows={6}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                    />
                  </>
                )}

                {uploadMsg && (
                  <p className={`text-sm ${uploadMsg.type === "ok" ? "text-green-600" : "text-red-500"}`}>
                    {uploadMsg.text}
                  </p>
                )}

                <div className="flex justify-end">
                  {mode === "file" ? (
                    <Button onClick={handleUploadFile} disabled={!file || uploading}>
                      {uploading ? "Memproses..." : "Upload & Embed"}
                    </Button>
                  ) : (
                    <Button onClick={handleAddText} disabled={!textContent.trim() || addingText}>
                      {addingText ? "Menambahkan..." : "Tambah Knowledge"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Knowledge List */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>
                  {loadingChunks
                    ? "Memuat..."
                    : `${grouped.size} sumber · ${chunks.length} chunk · ≈${totalTokens.toLocaleString()} token`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingChunks ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Memuat...</p>
                ) : grouped.size === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Belum ada knowledge. Upload PDF atau tambahkan teks di atas.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {[...grouped.entries()].map(([label, sourceChunks], i) => (
                      <div key={label}>
                        {i > 0 && <Separator className="mb-4" />}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{label}</Badge>
                            <span className="text-xs text-muted-foreground">{sourceChunks.length} chunk</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs h-7"
                            onClick={() => handleDeleteSource(label)}
                            disabled={sourceChunks.some((c) => deletingIds.has(c.id))}
                          >
                            Hapus semua
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {sourceChunks.map((chunk) => (
                            <div
                              key={chunk.id}
                              className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-muted/20 text-sm"
                            >
                              <p className="text-muted-foreground line-clamp-2 flex-1">{chunk.content}</p>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-muted-foreground">{chunk.tokenCount} tok</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 text-xs"
                                  onClick={() => handleDelete(chunk.id)}
                                  disabled={deletingIds.has(chunk.id)}
                                >
                                  {deletingIds.has(chunk.id) ? "..." : "Hapus"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
