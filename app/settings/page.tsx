import { AppShell } from "@/components/layout/app-shell";
import { SettingsForm } from "@/components/settings-form";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <AppShell pathname="/settings" title="Settings" subtitle="Configure your Empire OS preferences.">
      <SettingsForm initial={settings} />
    </AppShell>
  );
}
