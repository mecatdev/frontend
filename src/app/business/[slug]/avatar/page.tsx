"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Business } from "@/types/business";
import { useAudioAnalyzer } from "@/hooks/use-audio-analyzer";
import { AudioWave } from "./components/wave";
import { ChatPanel, type ChatMessage } from "./components/chat-panel";
import { MeetingControls } from "./components/controls";
import { EndCallDialog } from "./components/end-call-dialog";

type Props = { params: Promise<{ slug: string }> };

const DEMO_TRANSCRIPT: Omit<ChatMessage, "id" | "timestamp">[] = [
  { role: "assistant", text: "Hi! I'm the AI assistant for this business. Feel free to ask me anything about our company, vision, or investment details." },
  { role: "user", text: "What problem are you solving?" },
  { role: "assistant", text: "We identified a critical gap in the market where traditional players struggle to scale efficiently. Our solution reduces operational friction by 40% while maintaining quality — a combination that has proven very difficult to replicate." },
  { role: "user", text: "What's your revenue model?" },
  { role: "assistant", text: "We operate on a SaaS subscription model with tiered pricing based on usage. Enterprise clients also receive custom integrations which command a one-time implementation fee plus annual support contracts." },
];

function useDemoMessages(isActive: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const seededRef = useRef(false);

  useEffect(() => {
    if (!isActive || seededRef.current) return;
    seededRef.current = true;

    DEMO_TRANSCRIPT.forEach((msg, i) => {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { ...msg, id: crypto.randomUUID(), timestamp: new Date() },
        ]);
      }, i * 2200 + 800);
    });
  }, [isActive]);

  return messages;
}

function useCallTimer(isActive: boolean) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
      setSeconds(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function AvatarPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [error, setError] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEndCallOpen, setIsEndCallOpen] = useState(false);

  useEffect(() => {
    apiFetch<Business>(`/businesses/${encodeURIComponent(slug)}`)
      .then(setBusiness)
      .catch(() => setError(true));
  }, [slug]);

  const audio = useAudioAnalyzer();
  const messages = useDemoMessages(audio.isActive);
  const timer = useCallTimer(audio.isActive);

  const handleEndCall = useCallback(() => {
    if (audio.isActive) audio.toggle();
    setIsEndCallOpen(true);
  }, [audio]);

  const handleComplete = useCallback(() => {
    setIsEndCallOpen(false);
    router.push(`/business/${slug}`);
  }, [router, slug]);

  if (error) notFound();

  if (!business) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusText = audio.isActive
    ? audio.amplitude > 0.15
      ? "Listening..."
      : "Ready"
    : "Tap the mic to start";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-primary select-none">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* top bar */}
        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-primary/50 hover:text-primary/80 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <p className="text-sm font-semibold text-primary/80">{business.name}</p>
            {audio.isActive && (
              <span className="text-xs text-primary/40 tabular-nums">{timer}</span>
            )}
          </div>

          <div className="w-14" />
        </div>

        {/* error toast */}
        {audio.error && (
          <div className="mx-6 mt-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-xs text-red-300">
            {audio.error}
          </div>
        )}

        {/* orb area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-0 px-8">
          <div className="w-full max-w-lg h-56">
            <AudioWave
              amplitude={audio.amplitude}
              isActive={audio.isActive}
              frequencies={audio.frequencies}
            />
          </div>

          <p className="text-sm text-primary/40 tracking-wide transition-all duration-500">
            {statusText}
          </p>
        </div>

        {/* controls bar */}
        <div className="shrink-0 pb-10 pt-4">
          <MeetingControls
            isMicOn={audio.isActive}
            isChatOpen={isChatOpen}
            onToggleMic={audio.toggle}
            onToggleChat={() => setIsChatOpen((v) => !v)}
            onEndCall={handleEndCall}
          />
        </div>
      </div>

      {/* right panel */}
      <ChatPanel messages={messages} isOpen={isChatOpen} />

      <EndCallDialog
        open={isEndCallOpen}
        businessName={business.name}
        onComplete={handleComplete}
      />
    </div>
  );
}
