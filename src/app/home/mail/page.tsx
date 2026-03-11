"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apiFetch, apiUpload } from "@/lib/api";
import {
  type Mail,
  InboxHeader,
  InboxEmpty,
  InboxItem,
  MessageNode,
  ReplyComposer,
  EmptyThreadState,
  ThreadLoadingState,
  PageLoadingState,
  UserAvatar,
} from "@/components/mail";

export default function InvestorMailPage() {
  const [mails, setMails] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Mail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    apiFetch<Mail[]>("/mails")
      .then(setMails)
      .catch(() => setMails([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mails.length === 0) return;
    // top-level mails are initiated by the investor (sender)
    setCurrentUserId(mails[0].sender.id);
  }, [mails]);

  const openThread = useCallback(
    async (mailId: string, index: number) => {
      setSelectedId(mailId);
      setFocusedIndex(index);
      setThreadLoading(true);
      try {
        const thread = await apiFetch<Mail>(`/mails/${mailId}`);
        setSelected(thread);
        setMails((prev) =>
          prev.map((m) => (m.id === mailId ? { ...m, read: true } : m)),
        );
      } catch {
        /* handled silently */
      } finally {
        setThreadLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      )
        return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((p) => Math.min(p + 1, mails.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((p) => Math.max(p - 1, 0));
          break;
        case "Enter":
          if (mails[focusedIndex]) {
            e.preventDefault();
            openThread(mails[focusedIndex].id, focusedIndex);
          }
          break;
        case "Escape":
          setSelected(null);
          setSelectedId(null);
          break;
      }
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [focusedIndex, mails, openThread]);

  const unreadCount = useMemo(
    () => mails.filter((m) => !m.read).length,
    [mails],
  );

  if (loading) return <PageLoadingState />;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex w-full h-screen overflow-hidden shadow-sm">
        <div className="w-[360px] shrink-0 border-r border-border/60 flex flex-col bg-white">
          <InboxHeader unreadCount={unreadCount} />
          <ScrollArea className="flex-1">
            {mails.length === 0 ? (
              <InboxEmpty />
            ) : (
              <div>
                {mails.map((mail, index) => (
                  <InboxItem
                    key={mail.id}
                    mail={mail}
                    isSelected={selectedId === mail.id}
                    isFocused={focusedIndex === index}
                    onClick={() => openThread(mail.id, index)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {threadLoading ? (
            <ThreadLoadingState />
          ) : selected ? (
            <InvestorThread
              mail={selected}
              currentUserId={currentUserId}
              onReplySuccess={(reply) =>
                setSelected((p) =>
                  p ? { ...p, replies: [...(p.replies ?? []), reply] } : p,
                )
              }
            />
          ) : (
            <EmptyThreadState />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function InvestorThread({
  mail,
  currentUserId,
  onReplySuccess,
}: {
  mail: Mail;
  currentUserId: string;
  onReplySuccess: (reply: Mail) => void;
}) {
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const allMessages = useMemo(
    () => [mail, ...(mail.replies ?? [])],
    [mail],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = async (body: string, files: File[]) => {
    let messageBody = body.trim();
    if (!messageBody && files.length > 0) {
      messageBody = `Shared ${files.length} file${files.length > 1 ? "s" : ""}`;
    }
    if (!messageBody) return;

    setSending(true);
    try {
      const recipientId =
        mail.sender.id === currentUserId
          ? mail.recipient.id
          : mail.sender.id;

      const formData = new FormData();
      formData.append("recipientId", recipientId);
      formData.append("businessId", mail.business.id);
      formData.append("subject", `Re: ${mail.subject}`);
      formData.append("body", messageBody);
      formData.append("parentId", mail.id);
      files.forEach((f) => formData.append("files", f));

      const reply = await apiUpload<Mail>("/mails", formData);
      onReplySuccess(reply);
    } catch {
      /* handled silently */
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="px-6 py-4 shadow-sm shrink-0">
        <h2 className="text-base font-semibold tracking-tight truncate">
          {mail.subject}
        </h2>
        <div className="flex items-center gap-2 mt-1.5">
          <UserAvatar
            name={mail.sender.name}
            avatarUrl={mail.sender.avatarUrl}
          />
          <span className="text-[13px] text-muted-foreground">
            {mail.sender.name}
          </span>
          <span className="text-muted-foreground/30 text-xs">·</span>
          <span className="text-[12px] text-muted-foreground/60">
            {mail.business.name}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="relative">
            {allMessages.map((msg, i) => (
              <MessageNode
                key={msg.id}
                msg={msg}
                isFirst={i === 0}
                isLast={i === allMessages.length - 1}
                isCurrentUser={msg.sender.id === currentUserId}
              />
            ))}
          </div>
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <ReplyComposer onSend={handleSend} sending={sending} />
    </>
  );
}
