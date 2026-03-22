import { AppShell } from "@/components/layout/app-shell";
import { SuperpowersClient } from "@/components/superpowers-client";

export default function SuperpowersPage() {
  return (
    <AppShell
      pathname="/superpowers"
      title="Superpowers"
      subtitle="AI-powered strategic intelligence for your empire."
    >
      <SuperpowersClient />
    </AppShell>
  );
}
