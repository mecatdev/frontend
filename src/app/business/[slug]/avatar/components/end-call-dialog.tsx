"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

const TOTAL_STEPS = 3;

const EMAIL_TEMPLATE = `Dear [MSME Name] Team,

I had a great session learning about your business and I'd like to explore a potential partnership.

Please find attached relevant documentation for your review.

Best regards,
[Your Name]`;

interface EndCallDialogProps {
  open: boolean;
  businessId: string;
  businessName: string;
  businessOwnerId: string;
  onComplete: () => void;
}

export function EndCallDialog({
  open,
  businessId,
  businessName,
  businessOwnerId,
  onComplete,
}: EndCallDialogProps) {
  const [step, setStep] = useState(1);
  const [interested, setInterested] = useState<boolean | null>(null);
  const [emailBody, setEmailBody] = useState(EMAIL_TEMPLATE);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const progress = (step / TOTAL_STEPS) * 100;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleInterest = async (v: boolean) => {
    setInterested(v);
    if (v) {
      try {
        await apiFetch("/deals", {
          method: "POST",
          body: JSON.stringify({ businessId }),
        });
      } catch {
        // deal may already exist
      }
    }
    next();
  };

  const handleSendMail = async () => {
    setSending(true);
    try {
      await apiFetch("/mails", {
        method: "POST",
        body: JSON.stringify({
          recipientId: businessOwnerId,
          businessId,
          subject: interested
            ? `Investment Interest — ${businessName}`
            : `Follow-up — ${businessName}`,
          body: emailBody,
        }),
      });
    } catch {
      // continue even on error
    } finally {
      setSending(false);
      next();
    }
  };

  const handleEnjoy = (_: boolean) => onComplete();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onComplete(); }}>
      <DialogContent
        className="gap-0 p-0 overflow-hidden border"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Progress value={progress} className="rounded-none h-1" />

        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={back}
                className="flex gap-1 text-xs items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={12} />
                Back
              </button>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground tabular-nums">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>

          {step === 1 && (
            <Step1
              businessName={businessName}
              value={interested}
              onChange={handleInterest}
            />
          )}
          {step === 2 && (
            <Step2
              emailBody={emailBody}
              onEmailChange={setEmailBody}
              fileRef={fileRef}
              onNext={handleSendMail}
              sending={sending}
            />
          )}
          {step === 3 && (
            <Step3 onAnswer={handleEnjoy} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Step1({
  businessName,
  value,
  onChange,
}: {
  businessName: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Are you interested to make an offer?</DialogTitle>
        <DialogDescription>
          Let {businessName} know if you&apos;d like to proceed with an investment offer.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <ToggleButton
          label="Yes, I am"
          active={value === true}
          onClick={() => onChange(true)}
        />
        <ToggleButton
          label="Not right now"
          active={value === false}
          onClick={() => onChange(false)}
        />
      </div>
    </div>
  );
}

function Step2({
  emailBody,
  onEmailChange,
  fileRef,
  onNext,
  sending,
}: {
  emailBody: string;
  onEmailChange: (v: string) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onNext: () => void;
  sending: boolean;
}) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Do you have any mail you want to send?</DialogTitle>
        <DialogDescription>
          Customize this email template or leave it as-is. You can also attach a document.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <Textarea
          value={emailBody}
          onChange={(e) => onEmailChange(e.target.value)}
          className="h-[400px] resize-none text-sm leading-relaxed rounded-xl"
        />
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-input bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground/80">Attach document</p>
            <p className="text-xs text-muted-foreground truncate" id="file-label">
              PDF, DOCX, PPTX up to 10MB
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 pointer-events-none rounded-lg">
            Browse
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            className="sr-only"
            aria-labelledby="file-label"
            onChange={(e) => {
              const name = e.target.files?.[0]?.name;
              const label = document.getElementById("file-label");
              if (label && name) label.textContent = name;
            }}
          />
        </div>
      </div>
      <Button className="w-full h-12 rounded-xl" onClick={onNext} disabled={sending}>
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send & Continue"}
      </Button>
    </div>
  );
}

function Step3({ onAnswer }: { onAnswer: (v: boolean) => void }) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Did you enjoy this interview?</DialogTitle>
        <DialogDescription>
          Your feedback helps us improve the experience for everyone.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <ToggleButton label="Yes, loved it" active={false} onClick={() => onAnswer(true)} />
        <ToggleButton label="Not really" active={false} onClick={() => onAnswer(false)} />
      </div>
    </div>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-10 rounded-xl border text-sm font-medium transition-all duration-150 focus-visible:outline-none",
        active
          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/80"
          : "bg-background text-foreground border-input hover:bg-accent"
      )}
    >
      {label}
    </button>
  );
}
