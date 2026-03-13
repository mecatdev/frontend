"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import type { ChatMessage } from "@/app/business/[slug]/avatar/components/chat-panel";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface UseVoiceSessionOptions {
  businessId: string | null;
}

export interface VoiceSession {
  messages: ChatMessage[];
  isThinking: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  sendText: (text: string) => Promise<void>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionType = any;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType;
    webkitSpeechRecognition: SpeechRecognitionType;
  }
}

export function useVoiceSession({ businessId }: UseVoiceSessionOptions): VoiceSession {
  const { getToken } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationIdRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ref to always hold the latest sendTextInternal, so recognition callback
  // never captures a stale closure with businessId === null
  const sendTextRef = useRef<(text: string) => Promise<void>>(async () => {});

  // ── Resume STT helper ─────────────────────────────────────────────────────
  const resumeSTT = useCallback(() => {
    if (activeRef.current && recognitionRef.current) {
      setTimeout(() => {
        try { recognitionRef.current?.start(); } catch { /* ok */ }
      }, 300);
    }
  }, []);

  // ── Play base64 WAV ────────────────────────────────────────────────────────
  const playAudioBase64 = useCallback(async (base64: string, mimeType: string) => {
    return new Promise<void>((resolve) => {
      setIsSpeaking(true);

      try {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        audioRef.current = audio;

        const cleanup = () => {
          URL.revokeObjectURL(url);
          setIsSpeaking(false);
          resumeSTT();
          resolve();
        };

        audio.onended = cleanup;
        audio.onerror = cleanup;
        audio.play().catch(cleanup);
      } catch {
        setIsSpeaking(false);
        resolve();
      }
    });
  }, [resumeSTT]);

  // ── Browser TTS fallback (when Gemini TTS fails) ──────────────────────────
  const speakWithBrowserTTS = useCallback(async (text: string) => {
    if (!window.speechSynthesis) {
      resumeSTT();
      return;
    }

    return new Promise<void>((resolve) => {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 1;

      const cleanup = () => {
        setIsSpeaking(false);
        resumeSTT();
        resolve();
      };

      utterance.onend = cleanup;
      utterance.onerror = cleanup;
      window.speechSynthesis.speak(utterance);
    });
  }, [resumeSTT]);

  // ── Send text to backend ───────────────────────────────────────────────────
  const sendTextInternal = useCallback(async (text: string) => {
    if (!businessId) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text, timestamp: new Date() },
    ]);
    setIsThinking(true);

    // Pause STT while thinking/speaking
    recognitionRef.current?.stop();

    try {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/api/conversations/${businessId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message: text,
            conversationId: conversationIdRef.current ?? undefined,
          }),
        }
      );

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal mendapat respons");

      const { conversation, assistantMessage, assistantAudio } = json.data;
      conversationIdRef.current = conversation.id;

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessage.id,
          role: "assistant",
          text: assistantMessage.content,
          timestamp: new Date(assistantMessage.createdAt),
        },
      ]);

      if (assistantAudio?.base64) {
        await playAudioBase64(assistantAudio.base64, assistantAudio.mimeType ?? "audio/wav");
      } else {
        // Gemini TTS failed — use browser built-in TTS as fallback
        await speakWithBrowserTTS(assistantMessage.content);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mendapat respons");
    } finally {
      setIsThinking(false);
    }
  }, [businessId, getToken, playAudioBase64, speakWithBrowserTTS]);

  // Keep the ref always pointing to the latest sendTextInternal
  useEffect(() => {
    sendTextRef.current = sendTextInternal;
  }, [sendTextInternal]);

  // ── Build & init SpeechRecognition ────────────────────────────────────────
  const initRecognition = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setError("Browser ini tidak mendukung speech recognition. Gunakan Chrome/Edge.");
      return null;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "id-ID";

    rec.onresult = (e: any) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      if (transcript) {
        // Use ref so we always call the latest version (with current businessId)
        sendTextRef.current(transcript);
      }
    };

    rec.onerror = (e: any) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setError(`Mic error: ${e.error}`);
      }
    };

    // Auto-restart when single utterance ends
    rec.onend = () => {
      if (activeRef.current) {
        setTimeout(() => {
          if (activeRef.current) {
            try { rec.start(); } catch { /* already started */ }
          }
        }, 200);
      }
    };

    return rec;
  }, []);

  // ── Public controls ────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    if (!recognitionRef.current) return;

    activeRef.current = true;
    setIsListening(true);
    setError(null);

    try { recognitionRef.current.start(); } catch { /* already started */ }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    setIsListening(false);
    recognitionRef.current?.stop();
    audioRef.current?.pause();
    setIsSpeaking(false);
  }, []);

  const sendText = useCallback(async (text: string) => {
    await sendTextInternal(text);
  }, [sendTextInternal]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      activeRef.current = false;
      recognitionRef.current?.abort();
      audioRef.current?.pause();
    };
  }, []);

  return {
    messages,
    isThinking,
    isSpeaking,
    isListening,
    error,
    startListening,
    stopListening,
    sendText,
  };
}
