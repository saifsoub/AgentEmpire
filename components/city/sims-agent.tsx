"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { SimsPlumbob } from "@/components/city/sims-plumbob";

type Props = {
  position: [number, number, number];
  active?: boolean;
  walking?: boolean;
};

export function SimsAgent({ position, active, walking }: Props) {
  const ref = useRef<Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    t.current += delta;
    if (walking) {
      ref.current.position.x += (position[0] - ref.current.position.x) * 0.08;
      ref.current.position.z += (position[2] - ref.current.position.z) * 0.08;
      ref.current.position.y = Math.sin(t.current * 8) * 0.06;
    } else {
      ref.current.position.set(position[0], position[1], position[2]);
    }
  });

  return (
    <group ref={ref} position={position}>
      {active && <SimsPlumbob active y={2.1} />}
      {/* Head */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#FFCC80" roughness={0.7} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.52, 0]}>
        <boxGeometry args={[0.38, 0.18, 0.36]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.85, 0]}>
        <capsuleGeometry args={[0.2, 0.5, 6, 12]} />
        <meshStandardMaterial color="#42A5F5" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.12, 0.35, 0]}>
        <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
        <meshStandardMaterial color="#1565C0" />
      </mesh>
      <mesh position={[0.12, 0.35, 0]}>
        <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
        <meshStandardMaterial color="#1565C0" />
      </mesh>
    </group>
  );
}
