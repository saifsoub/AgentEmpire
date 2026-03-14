"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
type Field = { name: string; label: string; type?: "text" | "number" | "textarea"; placeholder?: string; };
export function QuickCreate({ endpoint, title, description, fields }: { endpoint: string; title: string; description: string; fields: Field[]; }) {
  const router = useRouter(); const [form, setForm] = useState<Record<string, string>>({}); const [submitting, setSubmitting] = useState(false);
  async function onSubmit() {
    setSubmitting(true);
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) { const data = await response.json(); alert(data.error ? JSON.stringify(data.error) : "Something went wrong"); }
      else { setForm({}); router.refresh(); }
    } finally { setSubmitting(false); }
  }
  return <div className="card p-5"><div className="mb-4"><h3 className="text-lg font-semibold text-primary">{title}</h3><p className="mt-1 text-sm text-secondary">{description}</p></div><div className="space-y-3">{fields.map(field=>field.type === "textarea" ? <div key={field.name}><label className="mb-2 block text-sm text-secondary">{field.label}</label><Textarea rows={4} placeholder={field.placeholder} value={form[field.name] ?? ""} onChange={e=>setForm(current=>({ ...current, [field.name]: e.target.value }))} /></div> : <div key={field.name}><label className="mb-2 block text-sm text-secondary">{field.label}</label><Input type={field.type ?? "text"} placeholder={field.placeholder} value={form[field.name] ?? ""} onChange={e=>setForm(current=>({ ...current, [field.name]: e.target.value }))} /></div>)}</div><Button className="mt-4 w-full" onClick={onSubmit} disabled={submitting}>{submitting ? "Saving..." : "Create"}</Button></div>;
}
