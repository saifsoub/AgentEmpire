import { AppShell } from "@/components/layout/app-shell";
import { CityMap } from "@/components/city/city-map";
import { CitizenRoster } from "@/components/city/citizen-roster";
import { CityEventFeed } from "@/components/city/city-event-feed";
import { MissionBoard } from "@/components/city/mission-board";

export default function CityPage() {
  return (
    <AppShell pathname="/city" title="S/ Happy Agent City" subtitle="Enter the living agent city.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(360px,0.85fr)]">
        <CityMap />
        <div className="grid gap-6">
          <CitizenRoster />
          <MissionBoard />
          <CityEventFeed />
        </div>
      </div>
    </AppShell>
  );
}
