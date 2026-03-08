"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea";
  placeholder?: string;
  required?: boolean;
};

export function QuickCreate({
  endpoint,
  title,
  description,
  fields,
  collapsible = false,
}: {
  endpoint: string;
  title: string;
  description: string;
  fields: Field[];
  collapsible?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(!collapsible);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: unknown };
        const msg = data.error
          ? typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error)
          : "Something went wrong. Please try again.";
        toast(msg, "error");
      } else {
        setForm({});
        toast("Created successfully!", "success");
        router.refresh();
      }
    } catch {
      toast("Network error. Please check your connection.", "error");
    } finally {
      setSubmitting(false);
    }
  }, [endpoint, form, router, toast]);

  // Cmd+Enter / Ctrl+Enter to submit
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && open && !submitting) {
        e.preventDefault();
        void submit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, submitting, submit]);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className={cn("w-full text-left", !collapsible && "cursor-default")}
        aria-expanded={open}
      >
        <div className="flex items-center justify-between p-5 pb-4">
          <div>
            <h3 className="text-base font-semibold text-primary">{title}</h3>
            <p className="mt-0.5 text-sm text-muted">{description}</p>
          </div>
          {collapsible && (
            <span className="ml-2 shrink-0 text-muted">
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          )}
        </div>
      </button>

      {/* Form */}
      {open && (
        <div className="px-5 pb-5">
          <div className="space-y-3">
            {fields.map((field) =>
              field.type === "textarea" ? (
                <div key={field.name}>
                  <label
                    htmlFor={`field-${field.name}`}
                    className="mb-1.5 block text-xs font-medium text-secondary"
                  >
                    {field.label}
                    {field.required && (
                      <span className="ml-1 text-accent" aria-label="required">
                        *
                      </span>
                    )}
                  </label>
                  <Textarea
                    id={`field-${field.name}`}
                    rows={3}
                    placeholder={field.placeholder}
                    value={form[field.name] ?? ""}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, [field.name]: e.target.value }))
                    }
                    aria-required={field.required}
                  />
                </div>
              ) : (
                <div key={field.name}>
                  <label
                    htmlFor={`field-${field.name}`}
                    className="mb-1.5 block text-xs font-medium text-secondary"
                  >
                    {field.label}
                    {field.required && (
                      <span className="ml-1 text-accent" aria-label="required">
                        *
                      </span>
                    )}
                  </label>
                  <Input
                    id={`field-${field.name}`}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    value={form[field.name] ?? ""}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, [field.name]: e.target.value }))
                    }
                    aria-required={field.required}
                  />
                </div>
              )
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="hidden text-xs text-muted sm:block">
              {navigator.platform.includes("Mac") ? "⌘ + Enter to save" : "Ctrl + Enter to save"}
            </span>
            <Button
              className="ml-auto min-w-[100px]"
              onClick={() => void submit()}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? "Saving…" : "Create"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

