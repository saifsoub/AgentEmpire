"use client";

import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import type { Group } from "three";
import type { CityBuildingDef } from "@/lib/city-world-config";

type Props = {
  building: CityBuildingDef;
  active?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

export function SimsLotHouse({ building, active, selected, onSelect }: Props) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [w, h, d] = building.size;
  const { position, wallColor, roofColor, trimColor, lotStyle } = building;
  const lift = h / 2;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.(building.id);
  };

  const roofHeight = lotStyle === "modern" ? 0.35 : lotStyle === "campus" ? 0.55 : 0.75;
  const bodyH = h * 0.65;

  return (
    <group
      ref={group}
      position={[position[0], position[1], position[2]]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={handleClick}
    >
      {/* Lot pad */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w + 1.2, d + 1.2]} />
        <meshStandardMaterial color={selected || hovered ? "#A8E6A1" : "#8FD492"} roughness={0.9} />
      </mesh>

      {/* Fence posts */}
      {[
        [-w / 2 - 0.4, d / 2 + 0.4],
        [w / 2 + 0.4, d / 2 + 0.4],
        [-w / 2 - 0.4, -d / 2 - 0.4],
        [w / 2 + 0.4, -d / 2 - 0.4],
      ].map(([fx, fz], i) => (
        <mesh key={i} position={[fx, 0.35, fz]}>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial color="#FFFBF5" />
        </mesh>
      ))}

      {/* Main structure */}
      <mesh position={[0, bodyH / 2 + 0.05, 0]}>
        <boxGeometry args={[w, bodyH, d]} />
        <meshStandardMaterial color={wallColor} roughness={0.75} />
      </mesh>

      {/* Trim band */}
      <mesh position={[0, 0.12, d / 2 + 0.02]}>
        <boxGeometry args={[w + 0.05, 0.2, 0.06]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>

      {/* Roof */}
      {lotStyle === "modern" ? (
        <mesh position={[0, bodyH + roofHeight / 2 + 0.05, 0]}>
          <boxGeometry args={[w + 0.15, roofHeight, d + 0.15]} />
          <meshStandardMaterial color={roofColor} roughness={0.6} />
        </mesh>
      ) : (
        <mesh position={[0, bodyH + roofHeight * 0.6, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[Math.max(w, d) * 0.72, roofHeight * 1.4, 4]} />
          <meshStandardMaterial color={roofColor} roughness={0.65} />
        </mesh>
      )}

      {/* Shop awning */}
      {lotStyle === "shop" && (
        <mesh position={[0, bodyH * 0.55, d / 2 + 0.35]}>
          <boxGeometry args={[w + 0.4, 0.08, 0.7]} />
          <meshStandardMaterial color={trimColor} />
        </mesh>
      )}

      {/* Door */}
      <mesh position={[0, bodyH * 0.28, d / 2 + 0.04]}>
        <boxGeometry args={[0.55, bodyH * 0.5, 0.08]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>

      {/* Windows */}
      {[-0.55, 0.55].map((wx) => (
        <mesh key={wx} position={[wx * (w / 2) * 0.65, bodyH * 0.55, d / 2 + 0.05]}>
          <boxGeometry args={[0.5, 0.45, 0.06]} />
          <meshStandardMaterial color="#B3E5FC" emissive="#81D4FA" emissiveIntensity={0.15} />
        </mesh>
      ))}

      {(active || selected || hovered) && (
        <Html position={[0, lift + 1.8, 0]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(255, 251, 245, 0.95)",
              border: `2px solid ${active ? "#00A550" : "#90CAF9"}`,
              borderRadius: 12,
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "#2D3436",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              fontFamily: "Nunito, system-ui, sans-serif",
            }}
          >
            {building.name}
          </div>
        </Html>
      )}
    </group>
  );
}
