import { AppShell } from "@/components/layout/app-shell";
import { CityMap } from "@/components/city/city-map";
import { SCityWorld } from "@/components/city/s-city-world";

export default function CityPage() {
  return (
    <AppShell pathname="/city" title="S/ City" subtitle="Skyline, palm-lined streets, and diverse 3D architecture. Every agent has a home. Every action leaves a record.">
      <div className="space-y-8">
        <SCityWorld />
        <CityMap />
      </div>
    </AppShell>
  );
}
