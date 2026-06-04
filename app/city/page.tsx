import { AppShell } from "@/components/layout/app-shell";
import { CityMap } from "@/components/city/city-map";

export default function CityPage() {
  return (
    <AppShell pathname="/city" title="Agent Control World" subtitle="Operator room — plan, execute, and govern your agents.">
      <CityMap />
    </AppShell>
  );
}
