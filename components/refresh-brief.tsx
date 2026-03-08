"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { useToast } from "@/components/toast";

export function RefreshBriefButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/briefings/generate", { method: "POST" });
      if (!res.ok) {
        toast("Failed to generate brief. Please try again.", "error");
      } else {
        toast("Weekly brief generated!", "success");
        router.refresh();
      }
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={() => void generate()} disabled={loading} aria-busy={loading}>
      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      {loading ? "Generating…" : "Generate brief"}
    </Button>
  );
}

