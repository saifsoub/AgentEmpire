import { AppShell } from "@/components/layout/app-shell";
import { CityMap } from "@/components/city/city-map";

export default function CityPage() {
  return (
    <AppShell pathname="/city" title="The City" subtitle="Navigate your districts. Every agent has a home. Every action leaves a record.">
      <CityMap />
    </AppShell>
  );
}
