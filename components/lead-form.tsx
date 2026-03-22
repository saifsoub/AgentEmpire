"use client";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button, Input, Textarea } from "@/components/ui";

interface LeadFormProps {
  sourceType: "offer" | "asset";
  sourceId: string;
  sourceName: string;
  ctaLabel?: string;
}

export function LeadForm({ sourceType, sourceId, sourceName, ctaLabel = "Request access" }: LeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, sourceType, sourceId, sourceName }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-accent" />
        <div className="text-lg font-semibold text-primary">You're on the list.</div>
        <p className="text-sm text-secondary">We'll be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm text-secondary">Your name</label>
        <Input placeholder="Sarah Al Mansouri" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-secondary">Work email</label>
        <Input type="email" placeholder="sarah@org.gov.ae" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-secondary">What's your biggest challenge right now? <span className="text-muted">(optional)</span></label>
        <Textarea rows={3} placeholder="Tell us what you're working on..." value={message} onChange={e => setMessage(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full gap-2 py-3 text-base">
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : ctaLabel}
      </Button>
    </form>
  );
}
