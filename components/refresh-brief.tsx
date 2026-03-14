"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function RefreshBriefButton() { const router = useRouter(); const [loading, setLoading] = useState(false); async function generate(){ setLoading(true); await fetch("/api/briefings/generate", { method: "POST" }); router.refresh(); setLoading(false); } return <button onClick={generate} className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90" disabled={loading}>{loading ? "Generating..." : "Generate weekly brief"}</button>; }
