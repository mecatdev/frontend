"use client";

import { Mic, MicOff, Phone, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingControlsProps {
  isMicOn: boolean;
  isChatOpen: boolean;
  onToggleMic: () => void;
  onToggleChat: () => void;
  onEndCall: () => void;
}

export function MeetingControls({
  isMicOn,
  isChatOpen,
  onToggleMic,
  onToggleChat,
  onEndCall,
}: MeetingControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <ControlButton
        label={isChatOpen ? "Hide chat" : "Show chat"}
        onClick={onToggleChat}
        active={isChatOpen}
        variant="ghost"
      >
        <MessageSquare size={18} />
      </ControlButton>

      <ControlButton
        label={isMicOn ? "Mute mic" : "Unmute mic"}
        onClick={onToggleMic}
        active={isMicOn}
        variant="mic"
        large
      >
        {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
      </ControlButton>

      <ControlButton
        label="End call"
        onClick={onEndCall}
        variant="danger"
      >
        <Phone size={18} className="rotate-[135deg]" />
      </ControlButton>
    </div>
  );
}

interface ControlButtonProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  variant: "ghost" | "mic" | "danger";
  large?: boolean;
  children: React.ReactNode;
}

function ControlButton({ label, onClick, active, variant, large, children }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        large ? "w-14 h-14" : "w-11 h-11",
        variant === "ghost" && [
          "bg-primary/10 hover:bg-primary/20 text-primary/70 hover:text-primary/20",
          active && "bg-primary/60 text-white hover:bg-primary/80",
        ],
        variant === "mic" && [
          "bg-white/15 hover:bg-primary/20 text-primary/70 hover:text-primary/20",
          active && "bg-primary/60 text-white hover:bg-primary/80 shadow-lg shadow-primary/30",
          !active && "bg-primary/10",
        ],
        variant === "danger" && "bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
      )}
    >
      {children}
    </button>
  );
}
