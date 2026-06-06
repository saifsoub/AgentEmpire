import { AppShell } from "@/components/layout/app-shell";
import { Card, Badge } from "@/components/ui";
import { FRAMEWORK, listPillars } from "@/lib/framework-data";

export default function FrameworkPage() {
  const summary = listPillars();

  return (
    <AppShell
      pathname="/framework"
      title="Governance Framework"
      subtitle={FRAMEWORK.vision}
    >
      {/* Overview strip */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map(p => (
          <a
            key={p.id}
            href={`#${p.id}`}
            className="rounded-xl border border-border bg-surface p-4 hover:border-accent/50 transition"
          >
            <div className="text-xs text-muted uppercase tracking-widest mb-1">Pillar</div>
            <div className="text-sm font-semibold text-primary leading-tight">{p.name}</div>
            <div className="mt-2 text-xs text-secondary">{p.componentCount} components</div>
          </a>
        ))}
      </div>

      {/* Framework header */}
      <div className="mb-8 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary">{FRAMEWORK.name}</h2>
            <p className="mt-1 text-sm text-secondary max-w-2xl">{FRAMEWORK.vision}</p>
          </div>
          <Badge>v{FRAMEWORK.version}</Badge>
        </div>
      </div>

      {/* Pillars */}
      <div className="space-y-10">
        {FRAMEWORK.pillars.map(pillar => (
          <section key={pillar.id} id={pillar.id}>
            {/* Pillar header */}
            <div className="mb-4 border-l-2 pl-4" style={{ borderColor: pillar.accentHex }}>
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: pillar.accentHex }}>
                Pillar
              </div>
              <h3 className="text-lg font-bold text-primary">{pillar.name}</h3>
              <p className="text-sm text-muted italic">{pillar.tagline}</p>
              <p className="mt-1 text-sm text-secondary">{pillar.description}</p>
            </div>

            {/* Components grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {pillar.components.map(comp => (
                <Card key={comp.id} className="p-5">
                  <div className="mb-3">
                    <h4 className="font-semibold text-primary">{comp.name}</h4>
                    <p className="mt-1 text-sm text-secondary">{comp.description}</p>
                  </div>

                  {/* Principles */}
                  <div className="mb-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                      Principles
                    </div>
                    <ul className="space-y-1">
                      {comp.principles.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-secondary">
                          <span className="mt-0.5 shrink-0" style={{ color: pillar.accentHex }}>
                            ›
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Maturity indicators */}
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                      Maturity signals
                    </div>
                    <ul className="space-y-1">
                      {comp.maturityIndicators.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-secondary">
                          <span className="mt-0.5 shrink-0 text-emerald-400">✓</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer credit */}
      <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted">
        {FRAMEWORK.name} · v{FRAMEWORK.version} · Loaded from <code className="text-accent">lib/framework-data.ts</code>
      </div>
    </AppShell>
  );
}
