"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { EmpireSettings } from "@/lib/types";

export function SettingsForm({ initial }: { initial: EmpireSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<EmpireSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key: keyof EmpireSettings, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ? JSON.stringify(data.error) : "Failed to save settings");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 max-w-2xl">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-primary mb-1">Empire Identity</h3>
        <p className="text-sm text-secondary mb-5">Name your empire and its owner.</p>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm text-secondary">Empire name</label>
            <Input
              value={form.empireName}
              onChange={e => update("empireName", e.target.value)}
              placeholder="Personal Empire"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-secondary">Your name</label>
            <Input
              value={form.ownerName}
              onChange={e => update("ownerName", e.target.value)}
              placeholder="Saif Soub"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-secondary">Primary market</label>
            <Input
              value={form.primaryMarket}
              onChange={e => update("primaryMarket", e.target.value)}
              placeholder="Government & Public Sector"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-primary mb-1">Regional Preferences</h3>
        <p className="text-sm text-secondary mb-5">Currency and time settings for your region.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-secondary">Currency</label>
            <Input
              value={form.currency}
              onChange={e => update("currency", e.target.value)}
              placeholder="AED"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-secondary">Timezone</label>
            <Input
              value={form.timezone}
              onChange={e => update("timezone", e.target.value)}
              placeholder="Asia/Dubai"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-secondary">Week starts on</label>
            <select
              value={form.weekStartsOn}
              onChange={e => update("weekStartsOn", e.target.value as "monday" | "sunday")}
              className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
        {saved && <span className="text-sm text-green-400">✓ Saved successfully</span>}
      </div>
    </div>
  );
}
