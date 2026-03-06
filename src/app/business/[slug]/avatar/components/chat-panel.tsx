"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  isOpen: boolean;
}

export function ChatPanel({ messages, isOpen }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={cn(
        "flex flex-col h-full border-l border-primary/40 bg-secondary backdrop-blur-xl transition-all duration-300 overflow-hidden",
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"
      )}
    >
      <div className="shrink-0 px-4 py-3 border-b border-white/10">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">Transcript</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-xs text-primary text-center mt-8">
            Transcript will appear here when the conversation starts.
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col gap-0.5",
              msg.role === "user" ? "items-end" : "items-start"
            )}
          >
            <span className="text-[10px] text-foreground px-1">
              {msg.role === "user" ? "You" : "AI"}
              {" · "}
              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div
              className={cn(
                "max-w-[85%] px-3 py-2 shadow-md bg-white text-foreground rounded-2xl text-sm leading-relaxed",
                msg.role === "user"
                  ? "rounded-tr-sm font-semibold border"
                  : "rounded-tl-sm border"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
