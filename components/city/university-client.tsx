'use client';

import { useCallback, useEffect, useState } from "react";
import { GraduationCap, BookOpen, Users, Award, FlaskConical, RefreshCw } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import type { StoredAgent, UniversityEnrollment } from "@/lib/types";
import type { UniversityProgram, FacultyExpert } from "@/lib/city-university";

const STATUS_STYLE: Record<UniversityEnrollment["status"], string> = {
  ENROLLED: "text-secondary",
  IN_TRAINING: "text-sky-400",
  TESTING: "text-amber-400",
  CERTIFIED: "text-emerald-400",
  FAILED: "text-red-400",
};

export function UniversityClient() {
  const [programs, setPrograms] = useState<UniversityProgram[]>([]);
  const [faculty, setFaculty] = useState<FacultyExpert[]>([]);
  const [enrollments, setEnrollments] = useState<UniversityEnrollment[]>([]);
  const [agents, setAgents] = useState<StoredAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [uniRes, agentsRes] = await Promise.all([fetch("/api/university"), fetch("/api/agents")]);
    const uni = await uniRes.json();
    const ag = await agentsRes.json();
    if (uni.ok) {
      setPrograms(uni.programs ?? []);
      setFaculty(uni.faculty ?? []);
      setEnrollments(uni.enrollments ?? []);
    }
    if (ag.ok) setAgents((ag.agents ?? []).filter((a: StoredAgent) => a.enabled));
  }, []);

  useEffect(() => { void load(); }, [load]);

  const enroll = async () => {
    if (!selectedAgent || !selectedProgram) return;
    setBusy(true); setError("");
    const res = await fetch("/api/university", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: selectedAgent, programId: selectedProgram }),
    });
    const data = await res.json();
    if (!data.ok) setError(data.error ?? "Enrollment failed");
    await load();
    setBusy(false);
  };

  const act = async (enrollmentId: string, action: "advance" | "exam") => {
    setBusy(true); setError("");
    const res = await fetch(`/api/university/${enrollmentId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!data.ok) setError(data.error ?? "Update failed");
    await load();
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      {/* Enrollment desk */}
      <Card className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Admissions Office</span>
        </div>
        <p className="mb-4 text-sm text-secondary">Owners enroll their agents to elevate capabilities. The resident faculty educates the agent session by session, then the Examination Board tests that the skills are applied successfully before any certification is granted.</p>
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none">
            <option value="">Select agent…</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} className="rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none">
            <option value="">Select program…</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.school}</option>)}
          </select>
          <Button onClick={enroll} disabled={busy || !selectedAgent || !selectedProgram}>Enroll Agent</Button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </Card>

      {/* Programs */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Programs</span>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {programs.map((p) => (
            <Card key={p.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-1 text-sm font-semibold text-primary">{p.name}</div>
              <div className="mb-2 text-xs uppercase tracking-wide text-muted">{p.school} · led by {p.facultyLead}</div>
              <p className="mb-3 text-xs leading-relaxed text-secondary">{p.focus}</p>
              <ul className="mb-3 space-y-1">
                {p.sessions.map((s) => <li key={s} className="text-xs text-muted">• {s}</li>)}
              </ul>
              <Badge>Pass mark {p.passMark}%</Badge>
            </Card>
          ))}
        </div>
      </div>

      {/* Faculty */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Resident Faculty — the full team of experts</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {faculty.map((f) => (
            <Card key={f.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="text-sm font-semibold text-primary">{f.name}</div>
              <div className="mb-1 text-xs text-accent">{f.title}</div>
              <p className="text-xs text-secondary">{f.speciality}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Enrollments */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Enrollments & Certifications</span>
        </div>
        {enrollments.length === 0 ? (
          <Card className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">No agents enrolled yet. Pick an agent and a program above to begin.</Card>
        ) : (
          <div className="space-y-3">
            {enrollments.map((e) => (
              <Card key={e.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-[180px]">
                    <div className="text-sm font-semibold text-primary">{e.agentName}</div>
                    <div className="text-xs text-muted">{e.programName} · {e.facultyLead}</div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={STATUS_STYLE[e.status]}>{e.status.replace("_", " ")}</span>
                      <span className="text-muted">{e.progress}% trained{typeof e.examScore === "number" ? ` · last exam ${e.examScore}%` : ""}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface2">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${e.progress}%` }} />
                    </div>
                  </div>
                  {e.status === "CERTIFIED" ? (
                    <Badge>🎓 {e.certificationId}</Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" disabled={busy || e.progress >= 100} onClick={() => act(e.id, "advance")}>
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Train session
                      </Button>
                      <Button disabled={busy} onClick={() => act(e.id, "exam")}>
                        <FlaskConical className="mr-1.5 h-3.5 w-3.5" /> Sit exam
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
