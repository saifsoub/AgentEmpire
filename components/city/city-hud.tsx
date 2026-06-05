"use client";

import Link from "next/link";
import {
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Edit3,
  Check,
  X,
  Eye,
  Lock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useCityAgentRun, type RunStatus } from "@/components/city/use-city-agent-run";
import { CITY_BUILDINGS, CITY_WORLD } from "@/lib/city-world-config";

type RunProps = ReturnType<typeof useCityAgentRun>;

export function CityHud(run: RunProps & { selectedId: string | null; onClearSelection: () => void }) {
  const {
    mode,
    setMode,
    status,
    objective,
    setObjective,
    thought,
    timeline,
    pending,
    editPayload,
    setEditPayload,
    isEditing,
    setIsEditing,
    apiResult,
    tlRef,
    isLive,
    canRun,
    reset,
    runObjective,
    handleApprove,
    handleReject,
    handleEditSave,
    SAMPLE_OBJECTIVES,
    selectedId,
    onClearSelection,
  } = run;

  const selected = selectedId ? CITY_BUILDINGS.find((b) => b.id === selectedId) : null;

  const statusText: Record<Exclude<RunStatus, "idle">, { msg: string; color: string }> = {
    running: { msg: "Your agent is on the way...", color: "#1976D2" },
    "awaiting-approval": { msg: "Needs approval at the Approval Desk", color: "#F9A825" },
    completed: { msg: "Shift complete!", color: "#00A550" },
    rejected: { msg: "Action declined", color: "#E53935" },
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-3 md:p-5">
      {/* Top bar — Sims-style neighborhood header */}
      <header
        className="pointer-events-auto mx-auto flex w-full max-w-6xl items-center gap-3 rounded-2xl border-2 border-white/80 px-4 py-3 shadow-lg"
        style={{ background: CITY_WORLD.uiPanel, boxShadow: `0 8px 24px ${CITY_WORLD.uiShadow}` }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black text-white"
          style={{ background: CITY_WORLD.uiGreen }}
        >
          S/
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-extrabold text-[#2D3436] md:text-lg" style={{ fontFamily: "Nunito, sans-serif" }}>
            Agents City
          </h1>
          <p className="truncate text-xs text-[#636E72]">Play with life — every agent has a lot. Every action leaves a record.</p>
        </div>
        <Link
          href="/dashboard"
          className="hidden rounded-xl border-2 border-[#DFE6E9] bg-white px-3 py-2 text-xs font-bold text-[#636E72] hover:bg-[#F8F9FA] sm:block"
        >
          Empire Menu
        </Link>
      </header>

      <div className="mt-3 flex flex-1 flex-col gap-3 overflow-hidden lg:flex-row lg:items-stretch">
        {/* Left: lot info */}
        <aside
          className="pointer-events-auto w-full shrink-0 overflow-y-auto rounded-2xl border-2 border-white/80 p-4 shadow-lg lg:w-72"
          style={{ background: CITY_WORLD.uiPanel, maxHeight: "calc(100vh - 140px)" }}
        >
          <div className="mb-3 flex items-center gap-2 text-[#00A550]">
            <MapPin size={14} />
            <span className="text-xs font-bold uppercase tracking-wide">Active Lot</span>
          </div>
          {selected ? (
            <div>
              <h2 className="text-lg font-extrabold text-[#2D3436]" style={{ fontFamily: "Nunito, sans-serif" }}>
                {selected.name}
              </h2>
              <p className="mt-1 text-sm text-[#636E72]">{selected.subtitle}</p>
              <p className="mt-2 text-xs text-[#B2BEC3]">{selected.district}</p>
              {selected.href && (
                <Link
                  href={selected.href}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                  style={{ background: CITY_WORLD.uiGreen }}
                >
                  Enter Building
                </Link>
              )}
              <button
                type="button"
                onClick={onClearSelection}
                className="mt-2 w-full rounded-xl border-2 border-[#DFE6E9] py-2 text-xs font-semibold text-[#636E72]"
              >
                Deselect
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#636E72]">Click a lot in the neighborhood to visit or send your agent there.</p>
          )}

          <div className="mt-5 rounded-xl bg-[#E8F5E9] p-3">
            <div className="flex items-center gap-2 text-[#2E7D32]">
              <Sparkles size={14} />
              <span className="text-xs font-bold">Agent mood</span>
            </div>
            <p className="mt-1 text-sm text-[#2D3436]">{thought}</p>
          </div>
        </aside>

        {/* Spacer for 3D view */}
        <div className="hidden flex-1 lg:block" />

        {/* Right: objective + approval */}
        <div
          className="pointer-events-auto flex w-full flex-col gap-3 overflow-y-auto lg:w-[380px]"
          style={{ maxHeight: "calc(100vh - 140px)" }}
        >
          {/* Mode pills */}
          <div
            className="rounded-2xl border-2 border-white/80 p-3 shadow-lg"
            style={{ background: CITY_WORLD.uiPanel }}
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#636E72]">Play mode</p>
            <div className="flex flex-wrap gap-2">
              {(["demo", "dry-run", "live"] as const).map((m) => {
                const on = mode === m;
                const label = m === "demo" ? "Practice" : m === "dry-run" ? "Preview" : "Live";
                const color = m === "live" ? "#E53935" : m === "dry-run" ? "#1976D2" : "#00A550";
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={isLive}
                    onClick={() => setMode(m)}
                    className="rounded-full px-3 py-1.5 text-xs font-bold transition"
                    style={{
                      background: on ? color : "#F1F2F6",
                      color: on ? "#fff" : "#636E72",
                      opacity: isLive && !on ? 0.5 : 1,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {mode === "live" && (
              <p className="mt-2 flex items-center gap-1 text-xs text-[#E53935]">
                <Lock size={10} /> Live actions need your approval first.
              </p>
            )}
          </div>

          {/* Objective */}
          <div
            className="rounded-2xl border-2 border-white/80 p-4 shadow-lg"
            style={{ background: CITY_WORLD.uiPanel }}
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#00A550]">Set a goal</p>
            <textarea
              className="w-full resize-none rounded-xl border-2 border-[#DFE6E9] bg-white p-3 text-sm text-[#2D3436] outline-none focus:border-[#00A550]"
              rows={3}
              placeholder={SAMPLE_OBJECTIVES[0]}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              disabled={isLive}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={runObjective}
                disabled={!canRun}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: canRun ? CITY_WORLD.uiGreen : "#B2BEC3" }}
              >
                <Play size={14} /> Go!
              </button>
              {(status === "completed" || status === "rejected") && (
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-2 rounded-xl border-2 border-[#DFE6E9] px-3 py-2 text-sm font-semibold text-[#636E72]"
                >
                  <RotateCcw size={12} /> New day
                </button>
              )}
            </div>
            {status !== "idle" && (
              <p className="mt-2 text-xs font-semibold" style={{ color: statusText[status as Exclude<RunStatus, "idle">].color }}>
                {statusText[status as Exclude<RunStatus, "idle">].msg}
              </p>
            )}
            {(mode === "dry-run" || mode === "live") && apiResult && (
              <pre className="mt-2 max-h-24 overflow-auto rounded-lg bg-[#F8F9FA] p-2 text-[10px] text-[#636E72]">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            )}
          </div>

          {/* Approval */}
          <div
            className="rounded-2xl border-2 p-4 shadow-lg"
            style={{
              background: pending ? "#FFFDE7" : CITY_WORLD.uiPanel,
              borderColor: pending ? "#FFD54F" : "rgba(255,255,255,0.8)",
            }}
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#F9A825]">Approval Desk</p>
            {!pending ? (
              <p className="text-sm text-[#636E72]">Nothing waiting. Big actions show up here for you to approve.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#2D3436]">{pending.summary}</p>
                {!isEditing ? (
                  <>
                    <pre className="max-h-20 overflow-auto rounded-lg bg-white/80 p-2 text-[10px]">{JSON.stringify(pending.payload, null, 2)}</pre>
                    <button type="button" onClick={() => { setEditPayload(JSON.stringify(pending.payload, null, 2)); setIsEditing(true); }} className="text-xs text-[#636E72]">
                      <Edit3 size={10} className="inline" /> Edit plan
                    </button>
                  </>
                ) : (
                  <>
                    <textarea className="w-full rounded-lg border p-2 text-[10px]" rows={5} value={editPayload} onChange={(e) => setEditPayload(e.target.value)} />
                    <div className="flex gap-2">
                      <button type="button" onClick={handleEditSave} className="text-xs text-[#00A550]"><Check size={10} className="inline" /> Save</button>
                      <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-[#E53935]"><X size={10} className="inline" /> Cancel</button>
                    </div>
                  </>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={handleApprove} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#00A550] py-2 text-sm font-bold text-white">
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button type="button" onClick={handleReject} className="flex flex-1 items-center justify-center gap-1 rounded-xl border-2 border-[#FFCDD2] py-2 text-sm font-bold text-[#E53935]">
                    <XCircle size={14} /> Decline
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div
            className="rounded-2xl border-2 border-white/80 p-4 shadow-lg"
            style={{ background: CITY_WORLD.uiPanel }}
          >
            <div className="mb-2 flex items-center gap-2 text-[#636E72]">
              <Clock size={12} />
              <span className="text-xs font-bold uppercase">Neighborhood log</span>
            </div>
            <div ref={tlRef} className="max-h-40 space-y-1 overflow-y-auto">
              {timeline.length === 0 ? (
                <p className="text-xs text-[#B2BEC3]">No events yet — set a goal and hit Go!</p>
              ) : (
                timeline.map((evt) => (
                  <div key={evt.id} className="rounded-lg bg-[#F8F9FA] px-2 py-1.5 text-xs text-[#2D3436]">
                    {evt.label}
                    <span className="ml-2 font-mono text-[10px] text-[#B2BEC3]">{evt.ts}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <p className="pointer-events-none mt-auto text-center text-[10px] text-white/90 drop-shadow md:text-xs">
        Drag to look around · Scroll to zoom · Click lots to visit · Inspired by life-sim neighborhood play
      </p>
    </div>
  );
}
