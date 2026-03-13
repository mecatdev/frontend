"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  FileText,
  Inbox,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type MailUser = { id: string; name: string; avatarUrl: string | null };
export type MailBusiness = { id: string; name: string; slug: string };

export type Attachment = {
  name: string;
  url: string;
  size: number;
  type: string;
};

export type Mail = {
  id: string;
  subject: string;
  body: string;
  attachments?: Attachment[] | null;
  read: boolean;
  parentId: string | null;
  createdAt: string;
  sender: MailUser;
  recipient: MailUser;
  business: MailBusiness;
  _count?: { replies: number };
  replies?: Mail[];
};

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 0) return "now";
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function resolveAttachmentUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return url;
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "sm",
}: {
  name: string;
  avatarUrl: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";
  const [w, h] = dim.split(" ").slice(0, 2);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${w} ${h} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary`}
    >
      {getInitials(name)}
    </div>
  );
}

export function InboxItem({
  mail,
  isSelected,
  isFocused,
  onClick,
}: {
  mail: Mail;
  isSelected: boolean;
  isFocused: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const replyCount = mail._count?.replies ?? 0;

  useEffect(() => {
    if (isFocused) {
      ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isFocused]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn("w-full text-left px-4 py-3.5 transition-all duration-150 outline-none",
        isSelected
          ? "bg-white border-l-2 border-l-primary"
          : "border-l-2 border-l-transparent hover:bg-muted/50",
          isFocused && "bg-muted/30",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <UserAvatar
            name={mail.sender.name}
            avatarUrl={mail.sender.avatarUrl}
            size="md"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[13px] truncate ${
                !mail.read
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {mail.sender.name}
            </span>
            <span className="text-[11px] text-muted-foreground/60 shrink-0 tabular-nums">
              {formatRelativeTime(mail.createdAt)}
            </span>
          </div>
          <p
            className={`text-[13px] truncate mt-0.5 ${
              !mail.read
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {mail.subject}
          </p>
          <p className="text-xs text-muted-foreground/50 truncate mt-0.5 leading-relaxed">
            {mail.body.slice(0, 90)}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            {!mail.read && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            )}
            {replyCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 font-normal gap-0.5"
              >
                <MessageSquare size={9} />
                {replyCount}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground/40 truncate">
              {mail.business.name}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function InboxHeader({ unreadCount }: { unreadCount: number }) {
  return (
    <div className="px-5 py-4 shrink-0">
      <div className="flex items-center gap-2">
        <Inbox size={16} className="text-foreground/70" />
        <h1 className="text-sm font-semibold tracking-tight">Inbox</h1>
        {unreadCount > 0 && (
          <Badge className="text-[10px] px-1.5 py-0 h-[18px] ml-auto font-medium">
            {unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function InboxEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
        <Inbox size={20} className="text-muted-foreground/30" />
      </div>
      <p className="text-sm text-muted-foreground">No messages yet</p>
      <p className="text-[11px] text-muted-foreground/50 mt-1">
        Conversations will appear here
      </p>
    </div>
  );
}

export function MessageNode({
  msg,
  isFirst,
  isLast,
  isCurrentUser,
}: {
  msg: Mail;
  isFirst: boolean;
  isLast: boolean;
  isCurrentUser: boolean;
}) {
  const attachments = (msg.attachments ?? []) as Attachment[];

  return (
    <div className="relative pl-12 pb-8 last:pb-0 group">
      {isFirst && (
        <>
          <div
            className="bg-muted-foreground absolute left-[13px] top-[18px] rounded-full h-2 w-2 z-10"
          />
          <div className="absolute left-[21px] top-[19px] w-[27px] h-0.5 bg-border/50" />
          {!isLast && (
            <div className="absolute left-[14px] top-[26px] bottom-0 w-0.5 bg-border/50" />
          )}
        </>
      )}

      {/* subsequent messages */}
      {!isFirst && (
        <>
          <div className="absolute left-[14px] top-0 w-[22px] h-6 border-l-2 border-b-2 border-border/40 rounded-bl-xl" />
          {!isLast && (
            <div className="absolute left-[14px] top-5 bottom-0 w-0.5 bg-border/50" />
          )}
        </>
      )}

      {/* message card */}
      <div
        className="rounded-lg px-4 py-3 bg-muted/40"
      >
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2.5">
            <UserAvatar
              name={msg.sender.name}
              avatarUrl={msg.sender.avatarUrl}
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-[13px] font-semibold">
                {msg.sender.name}
              </span>
              {isCurrentUser && (
                <span className="text-[10px] text-muted-foreground/60">
                  you
                </span>
              )}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] text-muted-foreground/50 cursor-default tabular-nums">
                {formatRelativeTime(msg.createdAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              {new Date(msg.createdAt).toLocaleString()}
            </TooltipContent>
          </Tooltip>
        </div>

        <p className="text-[13px] text-foreground/75 whitespace-pre-wrap leading-relaxed pl-[42px]">
          {msg.body}
        </p>

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pl-[42px]">
            {attachments.map((att, i) => (
              <a
                key={i}
                href={resolveAttachmentUrl(att.url)}
                target="_blank"
                rel="noopener noreferrer"
                download={att.name}
                className="flex items-center gap-1.5 bg-muted/40 rounded-md px-2.5 py-1.5 text-[11px] hover:bg-muted/60 transition-colors group/att"
              >
                <FileText
                  size={12}
                  className="text-muted-foreground shrink-0"
                />
                <span className="max-w-[140px] truncate font-medium">
                  {att.name}
                </span>
                <span className="text-muted-foreground/50 shrink-0">
                  {formatFileSize(att.size)}
                </span>
                <Download
                  size={11}
                  className="text-muted-foreground/40 group-hover/att:text-foreground shrink-0 ml-0.5"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReplyComposer({
  onSend,
  sending,
}: {
  onSend: (body: string, files: File[]) => void;
  sending: boolean;
}) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!body.trim() && files.length === 0) return;
    onSend(body, files);
    setBody("");
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = "";
  };

  return (
    <div className="border-t border-border/60 bg-white backdrop-blur-sm p-4 shrink-0">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-1.5 bg-muted/40 border border-border/40 rounded-md px-2.5 py-1 text-[11px]"
            >
              <Paperclip
                size={10}
                className="text-muted-foreground shrink-0"
              />
              <span className="max-w-[120px] truncate">{file.name}</span>
              <span className="text-muted-foreground/50 shrink-0">
                {formatFileSize(file.size)}
              </span>
              <button
                onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                className="text-muted-foreground/60 hover:text-foreground ml-0.5"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 justify-between border border-border-60 p-4 rounded-xl">
        <Textarea
          placeholder="Write a reply…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[88px] p-0 resize-none text-sm shadow-none bg-transparent border-none focus-visible:ring-0"
          disabled={sending}
        />
        <div className="flex gap-2 items-center">
          <input
            type="file"
            ref={fileRef}
            onChange={addFiles}
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.zip,.csv,.txt"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/60 hover:text-foreground"
                onClick={() => fileRef.current?.click()}
                disabled={sending}
              >
                <Paperclip size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach files</TooltipContent>
          </Tooltip>
          <Button
            onClick={handleSubmit}
            disabled={sending || (!body.trim() && files.length === 0)}
            size="sm"
            className="rounded-full"
          >
            {sending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EmptyThreadState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white">
      <div className="w-14 h-14 rounded-full bg-muted/20 flex items-center justify-center mb-4">
        <MessageSquare size={22} className="text-muted-foreground/30" />
      </div>
      <p className="text-sm font-medium text-muted-foreground/70">
        Select a conversation
      </p>
      <p className="text-[11px] text-muted-foreground/40 mt-1 max-w-[200px]">
        Choose a message from your inbox to view the full thread
      </p>
    </div>
  );
}

export function ThreadLoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/40" />
    </div>
  );
}

export function PageLoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );
}
