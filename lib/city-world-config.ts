import { cityInstitutions } from "@/lib/city-institutions";

export type CityBuildingKind = "institution" | "district" | "governor";
export type LotStyle = "cottage" | "modern" | "shop" | "campus" | "townhall";

export type CityBuildingDef = {
  id: string;
  name: string;
  subtitle: string;
  kind: CityBuildingKind;
  district: string;
  position: [number, number, number];
  size: [number, number, number];
  wallColor: string;
  roofColor: string;
  trimColor: string;
  lotStyle: LotStyle;
  href?: string;
  governorRoom?: "command" | "revenue" | "approval";
};

function pctToWorld(xPct: string, yPct: string): [number, number, number] {
  const x = (parseFloat(xPct) / 100) * 28 - 14;
  const z = (parseFloat(yPct) / 100) * 22 - 11;
  return [x, 0, z];
}

/** Sims-inspired pastel palettes per district. */
const DISTRICT_LOTS: CityBuildingDef[] = [
  { id: "exchange", name: "The Exchange", subtitle: "Deals in motion", kind: "district", district: "Commerce", position: [-10, 0, -4], size: [3.2, 2.8, 3.2], wallColor: "#FFF4E6", roofColor: "#E8A87C", trimColor: "#F4A261", lotStyle: "shop", href: "/opportunities" },
  { id: "market", name: "The Marketplace", subtitle: "Offers and assets", kind: "district", district: "Commerce", position: [-6, 0, -6], size: [3.4, 3, 3.4], wallColor: "#E8F8F5", roofColor: "#52B788", trimColor: "#2D6A4F", lotStyle: "shop", href: "/offers" },
  { id: "tower", name: "Broadcast Tower", subtitle: "Publish and amplify", kind: "district", district: "Media", position: [8, 0, -5], size: [2.4, 5.5, 2.4], wallColor: "#F3E8FF", roofColor: "#9D4EDD", trimColor: "#C77DFF", lotStyle: "modern", href: "/content" },
  { id: "chamber", name: "Council Chamber", subtitle: "Strategic choices", kind: "district", district: "Governance", position: [-8, 0, 4], size: [4, 3.2, 3.5], wallColor: "#FFE5EC", roofColor: "#FF8FAB", trimColor: "#FB6F92", lotStyle: "townhall", href: "/decisions" },
  { id: "arrivals", name: "Arrivals Hall", subtitle: "Visitors and inquiries", kind: "district", district: "Transit", position: [10, 0, 2], size: [3.8, 2.6, 2.8], wallColor: "#E3F2FD", roofColor: "#64B5F6", trimColor: "#1976D2", lotStyle: "modern", href: "/leads" },
  { id: "agency", name: "The Agency", subtitle: "Agents and citizens", kind: "district", district: "Agents", position: [4, 0, 6], size: [3.6, 3.4, 3.6], wallColor: "#E8F5E9", roofColor: "#81C784", trimColor: "#43A047", lotStyle: "campus", href: "/agents" },
  { id: "yards", name: "Work Yards", subtitle: "Active work orders", kind: "district", district: "Execution", position: [-2, 0, 7], size: [4, 2.2, 3], wallColor: "#FFF3E0", roofColor: "#FFB74D", trimColor: "#F57C00", lotStyle: "shop", href: "/tasks" },
  { id: "quarters", name: "The Quarters", subtitle: "Personal infrastructure", kind: "district", district: "Life", position: [6, 0, -8], size: [3, 2.8, 3], wallColor: "#FCE4EC", roofColor: "#F48FB1", trimColor: "#EC407A", lotStyle: "cottage", href: "/lifestyle" },
  { id: "archive", name: "The Archive", subtitle: "Records and config", kind: "district", district: "Memory", position: [-12, 0, 6], size: [2.8, 2.4, 2.6], wallColor: "#ECEFF1", roofColor: "#90A4AE", trimColor: "#546E7A", lotStyle: "cottage", href: "/settings" },
];

const GOVERNOR_LOTS: CityBuildingDef[] = [
  { id: "command", name: "Command Room", subtitle: "Planning & Control", kind: "governor", district: "Governor's Office", position: [-3.2, 0, 0], size: [2.8, 3.2, 2.8], wallColor: "#E1F5FE", roofColor: "#4FC3F7", trimColor: "#0288D1", lotStyle: "townhall", governorRoom: "command" },
  { id: "revenue", name: "Revenue Room", subtitle: "Execution & Business", kind: "governor", district: "Governor's Office", position: [0, 0, 0], size: [3.2, 3.8, 3.2], wallColor: "#F1F8E9", roofColor: "#7CB342", trimColor: "#558B2F", lotStyle: "townhall", governorRoom: "revenue" },
  { id: "approval", name: "Approval Desk", subtitle: "Governed Decisions", kind: "governor", district: "Governor's Office", position: [3.2, 0, 0], size: [2.8, 3, 2.8], wallColor: "#FFFDE7", roofColor: "#FFD54F", trimColor: "#F9A825", lotStyle: "townhall", governorRoom: "approval" },
];

const INSTITUTION_STYLES: Record<string, { wall: string; roof: string; trim: string; style: LotStyle }> = {
  "Control Path": { wall: "#E3F2FD", roof: "#42A5F5", trim: "#1565C0", style: "townhall" },
  "Learning Quarter": { wall: "#EDE7F6", roof: "#7E57C2", trim: "#5E35B1", style: "campus" },
  "Creator Valley": { wall: "#FCE4EC", roof: "#F06292", trim: "#C2185B", style: "modern" },
  "Commerce Park": { wall: "#E8F5E9", roof: "#66BB6A", trim: "#2E7D32", style: "shop" },
  "Reality District": { wall: "#FFF8E1", roof: "#FFCA28", trim: "#F9A825", style: "townhall" },
  "Memory Gardens": { wall: "#F3E5F5", roof: "#AB47BC", trim: "#7B1FA2", style: "cottage" },
  "Residential Loop": { wall: "#E0F7FA", roof: "#26C6DA", trim: "#00838F", style: "cottage" },
  "Innovation Docks": { wall: "#FFF3E0", roof: "#FFA726", trim: "#EF6C00", style: "modern" },
  "Workflow Transit": { wall: "#E8EAF6", roof: "#5C6BC0", trim: "#283593", style: "modern" },
};

const INSTITUTION_LOTS: CityBuildingDef[] = cityInstitutions.map((inst) => {
  const [x, , z] = pctToWorld(inst.x, inst.y);
  const s = INSTITUTION_STYLES[inst.district] ?? { wall: "#FFF8E7", roof: "#BCAAA4", trim: "#8D6E63", style: "cottage" as LotStyle };
  const scale = inst.status === "ready" ? 1 : 0.85;
  return {
    id: inst.id,
    name: inst.name,
    subtitle: inst.district,
    kind: "institution",
    district: inst.district,
    position: [x, 0, z],
    size: [2.8 * scale, 2.6 + inst.rooms.length * 0.12, 2.8 * scale],
    wallColor: s.wall,
    roofColor: s.roof,
    trimColor: s.trim,
    lotStyle: s.style,
    href: institutionHref(inst.id),
  };
});

function institutionHref(id: string): string | undefined {
  const routes: Record<string, string> = {
    "executive-hills": "/decisions",
    "s-treasury": "/offers",
    "evidence-registry": "/tasks",
    "approval-center": "/decisions",
    "agent-housing": "/agents",
    "research-zone": "/opportunities",
    "transportation-hub": "/tasks",
    "s-university": "/content",
    "s-academy": "/agents",
    "s-star-academy": "/content",
    "memory-systems": "/settings",
  };
  return routes[id];
}

export const CITY_BUILDINGS: CityBuildingDef[] = [
  ...GOVERNOR_LOTS,
  ...INSTITUTION_LOTS,
  ...DISTRICT_LOTS,
];

/** Sims 4–inspired world tuning: bright day, green lots, playful UI accent. */
export const CITY_WORLD = {
  groundSize: 52,
  grass: "#7BC67E",
  grassDark: "#5DAF60",
  path: "#D4B896",
  pathEdge: "#C4A574",
  skyTop: "#87CEEB",
  skyHorizon: "#B8E4F9",
  plumbob: "#2ECC71",
  plumbobActive: "#00C853",
  uiGreen: "#00A550",
  uiPanel: "#FFFBF5",
  uiShadow: "rgba(45, 62, 80, 0.18)",
  sun: [80, 120, 40] as [number, number, number],
} as const;

export const CITY_DECOR_TREES: [number, number, number][] = [
  [-14, 0, -8], [-13, 0, 2], [12, 0, -9], [13, 0, 5], [-5, 0, -10], [7, 0, 9],
  [-11, 0, -2], [11, 0, -2], [0, 0, -11], [-7, 0, 9], [9, 0, 8],
];
