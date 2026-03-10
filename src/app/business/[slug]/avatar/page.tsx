"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { fetchBusiness } from "@/lib/api";
import { useAudioAnalyzer } from "@/hooks/use-audio-analyzer";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { AudioWave } from "./components/wave";
import { ChatPanel } from "./components/chat-panel";
import { MeetingControls } from "./components/controls";
import { EndCallDialog } from "./components/end-call-dialog";

type Props = { params: Promise<{ slug: string }> };

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

  // ── Fetch real business from backend ──────────────────────────────────────
  const [businessName, setBusinessName] = useState<string>(slug);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [notFoundBusiness, setNotFoundBusiness] = useState(false);

  useEffect(() => {
    fetchBusiness(slug)
      .then((b) => {
        setBusinessName(b.name);
        setBusinessId(b.id);
      })
      .catch(() => setNotFoundBusiness(true));
  }, [slug]);

  if (notFoundBusiness) notFound();

  // ── Audio visualizer (mic level) ──────────────────────────────────────────
  const audio = useAudioAnalyzer();

  // ── Voice session (STT → AI → TTS) ───────────────────────────────────────
  const voice = useVoiceSession({ businessId });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEndCallOpen, setIsEndCallOpen] = useState(false);
  const timer = useCallTimer(audio.isActive);

  // ── Mic toggle: sync visualizer + voice session ───────────────────────────
  const handleToggleMic = useCallback(async () => {
    if (audio.isActive) {
      audio.toggle();
      voice.stopListening();
    } else {
      await audio.toggle();
      voice.startListening();
    }
  }, [audio, voice]);

  const handleEndCall = useCallback(() => {
    if (audio.isActive) audio.toggle();
    voice.stopListening();
    setIsEndCallOpen(true);
  }, [audio, voice]);

  const handleComplete = useCallback(() => {
    setIsEndCallOpen(false);
    router.push(`/business/${slug}`);
  }, [router, slug]);

  // ── Status text ───────────────────────────────────────────────────────────
  const statusText = !audio.isActive
    ? "Tap the mic to start"
    : voice.isThinking
    ? "Thinking..."
    : voice.isSpeaking
    ? "Speaking..."
    : audio.amplitude > 0.15
    ? "Listening..."
    : "Ready — speak now";

  const combinedError = audio.error ?? voice.error;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-primary select-none">
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top bar */}
        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-primary/50 hover:text-primary/80 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <p className="text-sm font-semibold text-primary/80">{businessName}</p>
            {audio.isActive && (
              <span className="text-xs text-primary/40 tabular-nums">{timer}</span>
            )}
          </div>

          <div className="w-14" />
        </div>

        {/* Error toast */}
        {combinedError && (
          <div className="mx-6 mt-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-xs text-red-500">
            {combinedError}
          </div>
        )}

        {/* Thinking / Speaking indicator */}
        {(voice.isThinking || voice.isSpeaking) && (
          <div className="mx-6 mt-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl text-xs text-primary/60 text-center animate-pulse">
            {voice.isThinking ? "AI sedang berpikir..." : "AI sedang berbicara..."}
          </div>
        )}

        {/* Orb area */}
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

        {/* Controls */}
        <div className="shrink-0 pb-10 pt-4">
          <MeetingControls
            isMicOn={audio.isActive}
            isChatOpen={isChatOpen}
            onToggleMic={handleToggleMic}
            onToggleChat={() => setIsChatOpen((v) => !v)}
            onEndCall={handleEndCall}
          />
        </div>
      </div>

      {/* Right panel */}
      <ChatPanel messages={voice.messages} isOpen={isChatOpen} />

      <EndCallDialog
        open={isEndCallOpen}
        businessName={businessName}
        onComplete={handleComplete}
      />
    </div>
  );
}
