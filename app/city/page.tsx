import { AppShell } from "@/components/layout/app-shell";
import { CityMap } from "@/components/city/city-map";
import { OperatingCity } from "@/components/city/operating-city";
import { buildCityState } from "@/lib/city-state";
import { getAgents, getDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CityPage() {
  const [db, agents] = await Promise.all([getDb(), getAgents()]);
  const cityState = buildCityState({ ...db, agents }, agents.length);

  return (
    <AppShell pathname="/city" title="AgentEmpire City" subtitle="The city is the product home. Districts activate from live operating state, and every governed action leaves evidence behind." showSidebar={false}>
      <div className="space-y-8">
        <OperatingCity state={cityState} />
        <CityMap showDistrictDirectory={false} />
      </div>
    </AppShell>
  );
}
