"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const dummyChunks = [
  {
    id: "1",
    sourceLabel: "Company Overview",
    content: "We are a B2B SaaS company providing AI-driven analytics for SMEs across Southeast Asia. Founded in 2023, we have grown to 50+ clients.",
  },
  {
    id: "2",
    sourceLabel: "Business Model",
    content: "Revenue comes from monthly subscriptions ranging from $99 to $499 per month depending on usage tier. We also offer enterprise custom plans.",
  },
  {
    id: "3",
    sourceLabel: "Traction",
    content: "ARR of $120,000 with 25% MoM growth. 3 pilot enterprise deals in Q1 2026. NPS score of 72.",
  },
];

export default function AIConfigurationPage() {
  const [chunks, setChunks] = useState(dummyChunks);
  const [content, setContent] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant representing this business. Answer investor questions accurately and professionally based on the provided knowledge."
  );

  const handleAddChunk = () => {
    if (!content.trim()) return;
    setChunks((prev) => [
      ...prev,
      { id: String(Date.now()), sourceLabel: sourceLabel.trim() || "Untitled", content: content.trim() },
    ]);
    setContent("");
    setSourceLabel("");
  };

  const handleDelete = (id: string) => {
    setChunks((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">AI Configuration</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the knowledge your AI assistant uses when responding to investors.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Prompt</CardTitle>
            <CardDescription>
              Define how your AI assistant should behave and respond.
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
            <div className="flex justify-end">
              <Button>Save Prompt</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>
              Add context your AI can retrieve when answering questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Input
                placeholder="Source label (e.g. Company Overview)"
                className="h-11 rounded-xl"
                value={sourceLabel}
                onChange={(e) => setSourceLabel(e.target.value)}
              />
              <Textarea
                placeholder="Paste your knowledge here..."
                className="resize-none rounded-xl"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleAddChunk} disabled={!content.trim()}>
                  Add Knowledge
                </Button>
              </div>
            </div>

            {chunks.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  {chunks.map((chunk) => (
                    <div
                      key={chunk.id}
                      className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-muted/30"
                    >
                      <div className="space-y-1 min-w-0">
                        <Badge variant="secondary" className="text-xs">
                          {chunk.sourceLabel}
                        </Badge>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {chunk.content}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                        onClick={() => handleDelete(chunk.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
