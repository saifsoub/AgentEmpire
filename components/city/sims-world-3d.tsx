"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import { CITY_BUILDINGS, CITY_DECOR_TREES, CITY_WORLD } from "@/lib/city-world-config";
import { SimsLotHouse } from "@/components/city/sims-lot-house";
import { SimsAgent } from "@/components/city/sims-agent";
import { SimsTree } from "@/components/city/sims-tree";
import type { RoomId } from "@/components/city/use-city-agent-run";

const ROOM_TO_BUILDING: Record<RoomId, string> = {
  command: "command",
  revenue: "revenue",
  approval: "approval",
};

type Props = {
  activeRoom: RoomId | null;
  isLive: boolean;
  selectedId: string | null;
  onSelectBuilding: (id: string) => void;
};

function CityScene({ activeRoom, isLive, selectedId, onSelectBuilding }: Props) {
  const agentPos = useMemo((): [number, number, number] => {
    const id = activeRoom ? ROOM_TO_BUILDING[activeRoom] : "revenue";
    const b = CITY_BUILDINGS.find((x) => x.id === id);
    if (!b) return [0, 0, 2.5];
    return [b.position[0], 0, b.position[2] + 2.2];
  }, [activeRoom]);

  return (
    <>
      <Sky sunPosition={CITY_WORLD.sun} turbidity={4} rayleigh={1.2} mieCoefficient={0.004} />
      <ambientLight intensity={0.55} />
      <directionalLight position={CITY_WORLD.sun} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <hemisphereLight args={["#87CEEB", "#7BC67E", 0.35]} />

      {/* Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_WORLD.groundSize, CITY_WORLD.groundSize]} />
        <meshStandardMaterial color={CITY_WORLD.grass} roughness={1} />
      </mesh>

      {/* Main road cross */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[5, CITY_WORLD.groundSize * 0.85]} />
        <meshStandardMaterial color={CITY_WORLD.path} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[CITY_WORLD.groundSize * 0.85, 5]} />
        <meshStandardMaterial color={CITY_WORLD.path} roughness={0.95} />
      </mesh>

      {/* Governor plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[5.5, 32]} />
        <meshStandardMaterial color={CITY_WORLD.grassDark} roughness={0.95} />
      </mesh>

      {CITY_DECOR_TREES.map((p, i) => (
        <SimsTree key={i} position={p} />
      ))}

      {CITY_BUILDINGS.map((b) => (
        <SimsLotHouse
          key={b.id}
          building={b}
          active={activeRoom !== null && b.governorRoom === activeRoom}
          selected={selectedId === b.id}
          onSelect={onSelectBuilding}
        />
      ))}

      <SimsAgent position={agentPos} active={isLive || activeRoom !== null} walking={isLive} />

      <OrbitControls
        makeDefault
        enablePan
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={12}
        maxDistance={42}
        target={[0, 0, 0]}
      />
    </>
  );
}

export function SimsWorld3D(props: Props) {
  return (
    <Canvas
      shadows
      camera={{ position: [22, 20, 22], fov: 42, near: 0.1, far: 120 }}
      style={{ width: "100%", height: "100%", background: `linear-gradient(180deg, ${CITY_WORLD.skyTop} 0%, ${CITY_WORLD.skyHorizon} 65%)` }}
    >
      <Suspense fallback={null}>
        <CityScene {...props} />
      </Suspense>
    </Canvas>
  );
}
