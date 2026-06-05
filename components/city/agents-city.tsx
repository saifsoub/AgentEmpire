"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { useCityAgentRun } from "@/components/city/use-city-agent-run";
import { CityHud } from "@/components/city/city-hud";
import { CITY_BUILDINGS } from "@/lib/city-world-config";

const SimsWorld3D = dynamic(() => import("@/components/city/sims-world-3d").then((m) => m.SimsWorld3D), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#87CEEB] to-[#B8E4F9] text-sm font-bold text-[#2D3436]">
      Loading neighborhood…
    </div>
  ),
});

export function AgentsCity() {
  const run = useCityAgentRun();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onSelectBuilding = useCallback((id: string) => {
    setSelectedId(id);
    const b = CITY_BUILDINGS.find((x) => x.id === id);
    if (b?.governorRoom) {
      /* governor lots highlight via activeRoom during runs */
    }
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap" rel="stylesheet" />
      <div className="absolute inset-0">
        <SimsWorld3D
          activeRoom={run.activeRoom}
          isLive={run.isLive}
          selectedId={selectedId}
          onSelectBuilding={onSelectBuilding}
        />
      </div>
      <CityHud {...run} selectedId={selectedId} onClearSelection={() => setSelectedId(null)} />
    </div>
  );
}
