"use client";
import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui";
import { useRole } from "@/components/role-context";
import { RoleBadge } from "@/components/role-badge";
import { ROLES, UserRole } from "@/lib/roles";
import { usePathname } from "next/navigation";

export default function SettingsPage() {
  const pathname = usePathname();
  const { role, setRole } = useRole();

  return (
    <AppShell
      pathname={pathname}
      title="Settings"
      subtitle="Configure your Personal Empire OS"
    >
      <div className="max-w-2xl space-y-6">
        {/* Role Management */}
        <SectionCard
          title="Access Role"
          description="Your current role controls what you can create, edit, and delete."
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-secondary">Current role:</span>
            <RoleBadge role={role} />
          </div>

          <div className="space-y-3">
            {(Object.entries(ROLES) as [UserRole, (typeof ROLES)[UserRole]][]).map(
              ([key, def]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-surface2 p-4 hover:bg-[#1e2d45] transition"
                >
                  <input
                    type="radio"
                    name="role"
                    value={key}
                    checked={role === key}
                    onChange={() => setRole(key)}
                    className="mt-0.5 accent-accent"
                    aria-label={`Switch to ${def.label} role`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">{def.label}</span>
                      {role === key && (
                        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-secondary">{def.description}</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      <li className={`text-xs ${def.canCreate ? "text-green-400" : "text-muted line-through"}`}>
                        ✦ Create entries
                      </li>
                      <li className={`text-xs ${def.canDelete ? "text-green-400" : "text-muted line-through"}`}>
                        ✦ Delete entries
                      </li>
                      <li className={`text-xs ${def.canSettings ? "text-green-400" : "text-muted line-through"}`}>
                        ✦ Manage settings
                      </li>
                    </ul>
                  </div>
                </label>
              )
            )}
          </div>
        </SectionCard>

        {/* App info */}
        <SectionCard title="About" description="Personal Empire OS v1.0">
          <p className="text-sm text-secondary">
            A personal business empire management dashboard built with Next.js 15, React 19, and Tailwind CSS.
            Data is stored in a local JSON file at <code className="rounded bg-surface2 px-1 text-accent">data/demo-db.json</code>.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border bg-surface2 p-3">
              <p className="text-muted">Framework</p>
              <p className="mt-1 text-primary">Next.js 15 App Router</p>
            </div>
            <div className="rounded-xl border border-border bg-surface2 p-3">
              <p className="text-muted">UI</p>
              <p className="mt-1 text-primary">React 19 + Tailwind CSS</p>
            </div>
            <div className="rounded-xl border border-border bg-surface2 p-3">
              <p className="text-muted">Persistence</p>
              <p className="mt-1 text-primary">File-based JSON</p>
            </div>
            <div className="rounded-xl border border-border bg-surface2 p-3">
              <p className="text-muted">Type safety</p>
              <p className="mt-1 text-primary">TypeScript + Zod</p>
            </div>
          </div>
        </SectionCard>

        {/* Danger zone (admin only) */}
        {role === "admin" && (
          <SectionCard title="Data" description="Manage your empire data">
            <p className="mb-4 text-sm text-secondary">
              Export your data as JSON or reset to the demo dataset.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" disabled>
                Export data (coming soon)
              </Button>
              <Button variant="ghost" disabled className="text-red-400 hover:text-red-300">
                Reset to demo data
              </Button>
            </div>
          </SectionCard>
        )}
      </div>
    </AppShell>
  );
}
