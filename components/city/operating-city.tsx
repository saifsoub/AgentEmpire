import Link from "next/link";
import { Archive, ArrowRight, Bot, DoorOpen, Hammer, Home, Radio, Scale, ShoppingBag, Sparkles, Target, TowerControl } from "lucide-react";
import { CityDistrictId, CityState } from "@/lib/city-state";
import { cn } from "@/lib/utils";

const ICONS: Record<CityDistrictId, React.ComponentType<{ className?: string }>> = {
  "exchange": Target,
  "marketplace": ShoppingBag,
  "broadcast-tower": Radio,
  "council-chamber": Scale,
  "arrivals-hall": DoorOpen,
  "governors-office": TowerControl,
  "agency": Bot,
  "work-yards": Hammer,
  "archive": Archive,
  "quarters": Home,
};

const VIEWPORT = { width: 1000, height: 760 };

function point(x: number, y: number) {
  return {
    x: (x / 100) * VIEWPORT.width,
    y: (y / 100) * VIEWPORT.height,
  };
}

function routePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const start = point(from.x, from.y);
  const end = point(to.x, to.y);
  const midY = Math.min(start.y, end.y) - 70;
  return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
}

export function OperatingCity({ state }: { state: CityState }) {
  const districts = Object.fromEntries(state.districts.map((district) => [district.id, district])) as Record<CityDistrictId, CityState["districts"][number]>;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          City-first operating surface
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary md:text-4xl">AgentEmpire City</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">{state.headline}. {state.briefing}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-secondary">
            <span className="rounded-full border border-border bg-surface px-3 py-1.5">{state.activeCount} active districts</span>
            <span className="rounded-full border border-border bg-surface px-3 py-1.5">{state.movingAgents} moving agents</span>
            <span className="rounded-full border border-border bg-surface px-3 py-1.5">{state.pendingApprovals} approvals waiting</span>
            <span className="rounded-full border border-border bg-surface px-3 py-1.5">{state.evidenceCount} evidence trail items</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(circle_at_top,_rgba(235,88,21,0.15),_transparent_38%),linear-gradient(180deg,_#0f1628_0%,_#0a0f1a_100%)] p-5 shadow-soft lg:p-8">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(126,138,163,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(126,138,163,0.16) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Main movement surface</div>
            <p className="mt-1 text-sm text-secondary">Districts activate from live product state. Routes now behave like services inside places, not the home of the product.</p>
          </div>
          <div className="rounded-2xl border border-border bg-app/70 px-4 py-3 text-xs text-secondary">
            <div className="font-semibold text-primary">Ambient command</div>
            <div className="mt-1">Superpowers are now expressed through the Governor’s Office and visible agent movement.</div>
          </div>
        </div>

        <div className="relative min-h-[860px] rounded-[1.6rem] border border-border/70 bg-[linear-gradient(180deg,_rgba(16,23,40,0.82),_rgba(8,13,23,0.92))] p-4 lg:min-h-[780px]">
          <svg viewBox={`0 0 ${VIEWPORT.width} ${VIEWPORT.height}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <filter id="city-glow">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {state.districts.filter((district) => district.id !== "governors-office").map((district) => {
              const governor = districts["governors-office"];
              const active = district.status === "active";
              return (
                <path
                  key={district.id}
                  d={routePath(governor, district)}
                  fill="none"
                  stroke={active ? district.accent : "#263248"}
                  strokeOpacity={active ? 0.55 : 0.35}
                  strokeWidth={active ? 5 : 3}
                  strokeDasharray={active ? "8 10" : "4 12"}
                />
              );
            })}

            {state.presences.flatMap((presence) =>
              presence.steps.map((step, index) => {
                const from = districts[step.from];
                const to = districts[step.to];
                const color = step.tone === "approval" ? "#fbbf24" : step.tone === "evidence" ? "#cbd5e1" : from.accent;
                return (
                  <g key={`${presence.id}-${step.from}-${step.to}`}>
                    <path d={routePath(from, to)} fill="none" stroke={color} strokeOpacity="0.12" strokeWidth="7" />
                    <circle r="7" fill={color} filter="url(#city-glow)">
                      <animateMotion dur={`${5 + index * 1.2}s`} repeatCount="indefinite" path={routePath(from, to)} />
                    </circle>
                  </g>
                );
              }),
            )}
          </svg>

          {state.districts.map((district) => {
            const Icon = ICONS[district.id];
            const active = district.status === "active";
            const ready = district.status === "ready";
            const governor = district.id === "governors-office";
            return (
              <div
                key={district.id}
                id={district.id === "governors-office" ? "governor-office" : undefined}
                className="absolute w-[14.5rem] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${district.x}%`, top: `${district.y}%` }}
              >
                <div
                  className={cn(
                    "overflow-hidden rounded-[1.5rem] border p-4 backdrop-blur-sm transition",
                    governor ? "w-[18rem] px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]" : "",
                  )}
                  style={{
                    borderColor: active ? district.accent : ready ? `${district.accent}66` : "#27324A",
                    background: active
                      ? `linear-gradient(180deg, ${district.glow}, rgba(11,16,28,0.96))`
                      : ready
                        ? `linear-gradient(180deg, ${district.glow.replace("0.18", "0.08")}, rgba(11,16,28,0.92))`
                        : "rgba(11,16,28,0.88)",
                    boxShadow: active ? `0 0 38px ${district.glow}` : "0 12px 28px rgba(0,0,0,0.24)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ borderColor: `${district.accent}55`, color: district.accent }}>
                        <Icon className="h-3.5 w-3.5" />
                        {district.status}
                      </div>
                      <h2 className="mt-3 text-lg font-semibold text-primary">{district.label}</h2>
                      <p className="mt-1 text-xs leading-5 text-secondary">{district.ownership}</p>
                    </div>
                    <Link href={district.href} className="inline-flex items-center gap-1 rounded-full border border-border bg-app/70 px-3 py-1.5 text-[11px] font-medium text-secondary hover:text-primary">
                      Enter <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/5 bg-black/10 p-3">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Signal</div>
                      <p className="mt-1 text-sm leading-6 text-primary">{district.signal}</p>
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-app/40 p-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Entry behavior</div>
                        <p className="mt-1 text-sm text-primary">{district.entryLabel}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Data relation</div>
                        <p className="mt-1 text-sm text-primary">{district.metric}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-secondary">{district.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {district.services.map((service) => (
                        <Link key={service.href} href={service.href} className="rounded-full border border-border bg-app/60 px-3 py-1.5 text-[11px] text-secondary transition hover:text-primary">
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="absolute bottom-4 left-4 right-4 z-10 grid gap-3 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-[1.5rem] border border-border bg-app/70 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                <Sparkles className="h-4 w-4 text-accent" />
                Active world story
              </div>
              <p className="mt-2 text-sm leading-6 text-secondary">{state.briefing}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border bg-app/70 p-4 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Agent presence</div>
              {state.presences.length > 0 ? (
                <ul className="mt-2 space-y-2 text-sm text-secondary">
                  {state.presences.map((presence) => (
                    <li key={presence.id}>
                      <span className="font-medium text-primary">{presence.label}</span>
                      <span className="block text-xs text-muted">{presence.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-secondary">No field movement yet. The city is ready to activate.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
