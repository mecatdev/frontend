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
import { ArrowLeft, Loader2, Paperclip, X } from "lucide-react";
import { apiFetch, apiUpload } from "@/lib/api";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      const formData = new FormData();
      formData.append("recipientId", businessOwnerId);
      formData.append("businessId", businessId);
      formData.append(
        "subject",
        interested
          ? `Investment Interest — ${businessName}`
          : `Follow-up — ${businessName}`,
      );
      formData.append("body", emailBody);
      if (selectedFile) {
        formData.append("files", selectedFile);
      }
      await apiUpload("/mails", formData);
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
              selectedFile={selectedFile}
              onFileChange={setSelectedFile}
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
  selectedFile,
  onFileChange,
  onNext,
  sending,
}: {
  emailBody: string;
  onEmailChange: (v: string) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onNext: () => void;
  sending: boolean;
  selectedFile: File | null;
  onFileChange: (f: File | null) => void;
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
        {selectedFile ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/30 bg-primary/5">
            <Paperclip size={14} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={() => {
                onFileChange(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-input bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip size={14} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground/80">Attach document</p>
              <p className="text-xs text-muted-foreground truncate">
                PDF, DOCX, PPTX up to 10MB
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 pointer-events-none rounded-lg">
              Browse
            </Button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            onFileChange(file);
          }}
        />
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
