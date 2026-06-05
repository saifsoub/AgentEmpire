"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

export function SimsPlumbob({
  active = true,
  y = 4.2,
}: {
  active?: boolean;
  y?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 1.8;
    ref.current.position.y = y + Math.sin(Date.now() * 0.002) * 0.15;
  });

  const color = active ? "#00C853" : "#81C784";

  return (
    <group position={[0, y, 0]}>
      <mesh ref={ref} rotation={[Math.PI, 0, 0]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} metalness={0.1} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color={color} transparent opacity={0.55} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}
