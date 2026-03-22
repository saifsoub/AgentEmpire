import { AppShell } from "@/components/layout/app-shell";

export default function SettingsPage() {
  return (
    <AppShell pathname="/settings" title="Settings" subtitle="Configure your Empire OS preferences.">
      <div className="card p-5 max-w-lg">
        <h3 className="text-lg font-semibold text-primary">Empire OS Settings</h3>
        <p className="mt-2 text-sm text-secondary">Configuration options coming soon.</p>
      </div>
    </AppShell>
  );
}
