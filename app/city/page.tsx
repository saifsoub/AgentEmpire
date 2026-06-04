import { AppShell } from "@/components/layout/app-shell";
import { CityMap } from "@/components/city/city-map";

export default function CityPage() {
  return (
    <AppShell pathname="/city" title="S/ Happy Agent City" subtitle="Enter the living agent city.">
      <CityMap />
    </AppShell>
  );
}
