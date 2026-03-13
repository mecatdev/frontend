"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Check, Loader2, ScanSearch } from "lucide-react";
import { useRouter } from "next/navigation";
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

type DealInfo = {
  deal: { id: string; status: string };
  investor: { id: string; name: string };
} | null;

export default function BusinessMailPage() {
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
    if (mails.length > 0) setCurrentUserId(mails[0].recipient.id);
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
            <BusinessThread
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

function BusinessThread({
  mail,
  currentUserId,
  onReplySuccess,
}: {
  mail: Mail;
  currentUserId: string;
  onReplySuccess: (reply: Mail) => void;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [dealInfo, setDealInfo] = useState<DealInfo>(null);
  const [dealLoading, setDealLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const allMessages = useMemo(
    () => [mail, ...(mail.replies ?? [])],
    [mail],
  );

  const investorId = mail.sender.id;

  // check if any message from the investor (non-current-user) has attachments
  const investorAttachments = useMemo(() => {
    return allMessages
      .filter((m) => m.sender.id !== currentUserId && (m.attachments?.length ?? 0) > 0)
      .flatMap((m) => m.attachments ?? []);
  }, [allMessages, currentUserId]);

  useEffect(() => {
    apiFetch<
      Array<{
        investor: { id: string; name: string };
        deal: { id: string; status: string };
      }>
    >(`/businesses/${mail.business.id}/investors?limit=100`)
      .then((res) => {
        const list = res as unknown as Array<{
          investor: { id: string; name: string };
          deal: { id: string; status: string };
        }>;
        const match = list.find((item) => item.investor.id === investorId);
        setDealInfo(match ?? null);
      })
      .catch(() => setDealInfo(null))
      .finally(() => setDealLoading(false));
  }, [mail.business.id, investorId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleApprove = async () => {
    if (!dealInfo) return;
    setApproving(true);
    try {
      await apiFetch(`/deals/${dealInfo.deal.id}/approve`, {
        method: "PATCH",
      });
      setDealInfo({
        ...dealInfo,
        deal: { ...dealInfo.deal, status: "NEGOTIATING" },
      });
    } catch {
      /* handled silently */
    } finally {
      setApproving(false);
    }
  };

  const handleSend = async (body: string, files: File[]) => {
    let messageBody = body.trim();
    if (!messageBody && files.length > 0) {
      messageBody = `Shared ${files.length} file${files.length > 1 ? "s" : ""}`;
    }
    if (!messageBody) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("recipientId", mail.sender.id);
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
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
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
          <div className="shrink-0 flex items-center gap-2">
            {investorAttachments.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8"
                onClick={() => router.push(`/dashboard/mail/${mail.id}/analyze`)}
              >
                <ScanSearch size={13} />
                Analyze Document
              </Button>
            )}
            {!dealLoading && dealInfo && dealInfo.deal.status === "DRAFT" && (
              <Button
                onClick={handleApprove}
                disabled={approving}
                size="sm"
                className="gap-1.5 h-8"
              >
                {approving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                Accept as Investor
              </Button>
            )}
            {!dealLoading && dealInfo && dealInfo.deal.status !== "DRAFT" && (
              <Badge className="bg-primary/10 border-primary/40 text-primary shadow-none text-[11px] px-2.5 py-1 gap-1">
                <Check size={11} />
                Accepted
              </Badge>
            )}
          </div>
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
