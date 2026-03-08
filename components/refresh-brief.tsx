"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshBriefButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/briefings/generate", { method: "POST" });
      if (!res.ok) setError("Failed to generate brief. Please try again.");
      else router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-400">{error}</p>
      )}
      <button
        onClick={generate}
        className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Generating…" : "Generate weekly brief"}
      </button>
    </div>
  );
}
