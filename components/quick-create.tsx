"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button, Input, Textarea } from "@/components/ui";

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
}: {
  endpoint: string;
  title: string;
  description: string;
  fields: Field[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: unknown };
        setError(data.error ? JSON.stringify(data.error) : "Something went wrong. Please try again.");
      } else {
        setForm({});
        setSuccess(true);
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        successTimerRef.current = setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        <p className="mt-1 text-sm text-secondary">{description}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
        >
          Saved successfully!
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field) =>
          field.type === "textarea" ? (
            <div key={field.name}>
              <label htmlFor={`field-${field.name}`} className="mb-2 block text-sm text-secondary">
                {field.label}
                {field.required && <span className="ml-1 text-accent" aria-label="required">*</span>}
              </label>
              <Textarea
                id={`field-${field.name}`}
                rows={4}
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
              <label htmlFor={`field-${field.name}`} className="mb-2 block text-sm text-secondary">
                {field.label}
                {field.required && <span className="ml-1 text-accent" aria-label="required">*</span>}
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

      <Button className="mt-4 w-full" onClick={onSubmit} disabled={submitting}>
        {submitting ? "Saving…" : "Create"}
      </Button>
    </div>
  );
}
