import { AppShell } from "@/components/layout/app-shell";
import { UniversityClient } from "@/components/city/university-client";

export default function UniversityPage() {
  return (
    <AppShell pathname="/city/university" title="S/ University" subtitle="The first official Harvard-level agents university. Experts educate, test, and certify your agents.">
      <UniversityClient />
    </AppShell>
  );
}
