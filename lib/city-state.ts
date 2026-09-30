import { DemoDb, Task } from "@/lib/types";

export const CITY_DISTRICT_IDS = [
  "exchange",
  "marketplace",
  "broadcast-tower",
  "council-chamber",
  "arrivals-hall",
  "governors-office",
  "agency",
  "work-yards",
  "archive",
  "quarters",
] as const;

export type CityDistrictId = (typeof CITY_DISTRICT_IDS)[number];

export type CityDistrictStatus = "active" | "ready" | "idle";

type DistrictLink = { label: string; href: string };

export interface CityDistrictState {
  id: CityDistrictId;
  label: string;
  href: string;
  ownership: string;
  entryLabel: string;
  signal: string;
  metric: string;
  summary: string;
  services: DistrictLink[];
  status: CityDistrictStatus;
  accent: string;
  glow: string;
  x: number;
  y: number;
}

export interface CityJourneyStep {
  from: CityDistrictId;
  to: CityDistrictId;
  label: string;
  tone: "running" | "approval" | "evidence";
}

export interface CityPresence {
  id: string;
  label: string;
  district: CityDistrictId;
  status: string;
  steps: CityJourneyStep[];
}

export interface CityState {
  headline: string;
  briefing: string;
  districts: CityDistrictState[];
  activeDistrictIds: CityDistrictId[];
  activeCount: number;
  pendingApprovals: number;
  evidenceCount: number;
  movingAgents: number;
  presences: CityPresence[];
}

type DistrictMeta = Omit<CityDistrictState, "signal" | "metric" | "summary" | "status">;

const DISTRICTS: Record<CityDistrictId, DistrictMeta> = {
  "exchange": {
    id: "exchange",
    label: "The Exchange",
    href: "/opportunities",
    ownership: "Opportunities, deals, commercial movement",
    entryLabel: "Review deal flow",
    services: [{ label: "Opportunities", href: "/opportunities" }],
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.18)",
    x: 17,
    y: 18,
  },
  "marketplace": {
    id: "marketplace",
    label: "The Marketplace",
    href: "/offers",
    ownership: "Offers, assets, commercial capabilities",
    entryLabel: "Open commercial floor",
    services: [
      { label: "Offers", href: "/offers" },
      { label: "Assets", href: "/assets" },
    ],
    accent: "#2dd4bf",
    glow: "rgba(45,212,191,0.18)",
    x: 50,
    y: 16,
  },
  "broadcast-tower": {
    id: "broadcast-tower",
    label: "Broadcast Tower",
    href: "/content",
    ownership: "Content creation and publishing",
    entryLabel: "Enter publishing floor",
    services: [{ label: "Content", href: "/content" }],
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.18)",
    x: 83,
    y: 18,
  },
  "council-chamber": {
    id: "council-chamber",
    label: "Council Chamber",
    href: "/decisions",
    ownership: "Decisions, approvals, briefings",
    entryLabel: "Enter decision chamber",
    services: [
      { label: "Decisions", href: "/decisions" },
      { label: "Briefings", href: "/briefings" },
    ],
    accent: "#f472b6",
    glow: "rgba(244,114,182,0.18)",
    x: 17,
    y: 48,
  },
  "arrivals-hall": {
    id: "arrivals-hall",
    label: "Arrivals Hall",
    href: "/leads",
    ownership: "Leads and inbound requests",
    entryLabel: "Check inbound queue",
    services: [{ label: "Leads", href: "/leads" }],
    accent: "#60a5fa",
    glow: "rgba(96,165,250,0.18)",
    x: 83,
    y: 48,
  },
  "governors-office": {
    id: "governors-office",
    label: "Governor’s Office",
    href: "/city#governor-office",
    ownership: "Governed operator surface and ambient command",
    entryLabel: "Open command floor",
    services: [{ label: "Governor’s Office", href: "/city#governor-office" }],
    accent: "#f97316",
    glow: "rgba(249,115,22,0.18)",
    x: 50,
    y: 46,
  },
  "agency": {
    id: "agency",
    label: "The Agency",
    href: "/agents",
    ownership: "Agents and worker registry",
    entryLabel: "Visit registry",
    services: [{ label: "Agents", href: "/agents" }],
    accent: "#34d399",
    glow: "rgba(52,211,153,0.18)",
    x: 17,
    y: 78,
  },
  "work-yards": {
    id: "work-yards",
    label: "Work Yards",
    href: "/tasks",
    ownership: "Tasks and execution queues",
    entryLabel: "Inspect work orders",
    services: [{ label: "Tasks", href: "/tasks" }],
    accent: "#fb923c",
    glow: "rgba(251,146,60,0.18)",
    x: 50,
    y: 80,
  },
  "archive": {
    id: "archive",
    label: "The Archive",
    href: "/settings",
    ownership: "Settings, history, evidence trail",
    entryLabel: "Open archive",
    services: [{ label: "Archive", href: "/settings" }],
    accent: "#94a3b8",
    glow: "rgba(148,163,184,0.18)",
    x: 83,
    y: 78,
  },
  "quarters": {
    id: "quarters",
    label: "The Quarters",
    href: "/lifestyle",
    ownership: "Personal and lifestyle infrastructure",
    entryLabel: "Return to quarters",
    services: [{ label: "Lifestyle", href: "/lifestyle" }],
    accent: "#e879f9",
    glow: "rgba(232,121,249,0.18)",
    x: 50,
    y: 95,
  },
};

const ACTIVE_OPPORTUNITY_STATUSES = new Set(["VALIDATING", "PACKAGING", "SELLING", "LIVE"]);
const MARKETPLACE_STATUSES = new Set(["READY", "LIVE", "PRODUCTIZED", "PUBLISHED", "MONETIZED"]);
const CONTENT_ACTIVE_STATUSES = new Set(["SCHEDULED", "PUBLISHED"]);
const ACTIVE_TASK_STATUSES = new Set(["TODO", "IN_PROGRESS", "WAITING_APPROVAL", "BLOCKED"]);

function countStatuses(items: Array<{ status: string }> | undefined, statuses: Set<string>) {
  return (items ?? []).filter((item) => statuses.has(item.status)).length;
}

function taskDistrict(task: Task | undefined): CityDistrictId | null {
  if (!task) return null;
  switch (task.linkedEntityType) {
    case "lead":
      return "arrivals-hall";
    case "offer":
    case "asset":
      return "marketplace";
    case "content":
      return "broadcast-tower";
    case "opportunity":
      return "exchange";
    case "decision":
    case "approval":
      return "council-chamber";
    default:
      return "work-yards";
  }
}

function detectPrimaryTarget(db: DemoDb, activeDistricts: CityDistrictId[]): CityDistrictId {
  const activeTask = (db.tasks ?? []).find((task) => ACTIVE_TASK_STATUSES.has(task.status));
  const fromTask = taskDistrict(activeTask);
  if (fromTask && activeDistricts.includes(fromTask)) return fromTask;
  return activeDistricts[0] ?? "work-yards";
}

export function buildCityState(db: DemoDb, agentCount = db.agents?.length ?? 0): CityState {
  const newLeads = (db.leads ?? []).filter((lead) => lead.status === "NEW").length;
  const activeOpportunities = countStatuses(db.opportunities, ACTIVE_OPPORTUNITY_STATUSES);
  const readyMarketplace = (db.offers ?? []).filter((offer) => MARKETPLACE_STATUSES.has(offer.status)).length +
    (db.assets ?? []).filter((asset) => MARKETPLACE_STATUSES.has(asset.status)).length;
  const readyContent = countStatuses(db.contentItems, CONTENT_ACTIVE_STATUSES);
  const pendingApprovals = (db.approvals ?? []).filter((approval) => approval.status === "PENDING").length +
    (db.tasks ?? []).filter((task) => task.status === "WAITING_APPROVAL").length;
  const activeTasks = (db.tasks ?? []).filter((task) => ACTIVE_TASK_STATUSES.has(task.status)).length;
  const completedTasks = (db.tasks ?? []).filter((task) => task.status === "DONE").length;
  const evidenceCount = completedTasks + (db.agentRuns?.length ?? 0) + (db.approvals ?? []).filter((approval) => approval.status !== "PENDING").length;
  const lifestyleSignals = (db.lifestyle ?? []).filter((item) => item.status === "ACTIVE").length;
  const enabledAgents = Math.max(agentCount, (db.agents ?? []).filter((agent) => agent.enabled).length);
  const movingAgents = Math.max(
    (db.agentRuns ?? []).filter((run) => !/fail|reject/i.test(run.status)).length,
    activeTasks > 0 || pendingApprovals > 0 ? 1 : 0,
  );

  const districts: CityDistrictState[] = [
    {
      ...DISTRICTS["exchange"],
      status: activeOpportunities > 0 ? "active" : db.opportunities.length ? "ready" : "idle",
      signal: activeOpportunities > 0 ? `${activeOpportunities} active opportunities moving through the district.` : "No active opportunities are currently moving.",
      metric: `${db.opportunities.length} tracked opportunity${db.opportunities.length === 1 ? "" : "ies"}`,
      summary: db.opportunities[0]?.nextAction || "Capture, score, and route the next commercial move.",
    },
    {
      ...DISTRICTS["marketplace"],
      status: readyMarketplace > 0 ? "active" : db.offers.length || db.assets.length ? "ready" : "idle",
      signal: readyMarketplace > 0 ? `${readyMarketplace} commercial surfaces are live or ready to sell.` : "No offer or asset is ready for market yet.",
      metric: `${db.offers.length + db.assets.length} offers + assets`,
      summary: db.offers[0]?.promise || db.assets[0]?.summary || "Package assets and offers into clear buying surfaces.",
    },
    {
      ...DISTRICTS["broadcast-tower"],
      status: readyContent > 0 ? "active" : db.contentItems.length ? "ready" : "idle",
      signal: readyContent > 0 ? `${readyContent} pieces are ready or already broadcasting.` : "The publishing floor is currently quiet.",
      metric: `${db.contentItems.length} content item${db.contentItems.length === 1 ? "" : "s"}`,
      summary: db.contentItems[0]?.hook || "Turn ideas into scheduled or published authority.",
    },
    {
      ...DISTRICTS["council-chamber"],
      status: pendingApprovals > 0 ? "active" : db.decisions.length || db.briefings.length ? "ready" : "idle",
      signal: pendingApprovals > 0 ? `${pendingApprovals} approvals or governed choices need executive attention.` : "No pending approvals at the moment.",
      metric: `${db.decisions.length} decisions · ${db.briefings.length} briefings`,
      summary: db.briefings[0]?.weekObjective || db.decisions[0]?.reasoningSummary || "High-consequence choices gather here before they move.",
    },
    {
      ...DISTRICTS["arrivals-hall"],
      status: newLeads > 0 ? "active" : db.leads.length ? "ready" : "idle",
      signal: newLeads > 0 ? `${newLeads} new inbound request${newLeads === 1 ? "" : "s"} just arrived.` : "No new inbound requests are waiting.",
      metric: `${db.leads.length} total lead${db.leads.length === 1 ? "" : "s"}`,
      summary: db.leads[0]?.sourceName || "Every new inquiry enters the city through this hall.",
    },
    {
      ...DISTRICTS["governors-office"],
      status: movingAgents > 0 || pendingApprovals > 0 ? "active" : enabledAgents > 0 ? "ready" : "idle",
      signal: movingAgents > 0 ? `${movingAgents} agent ${movingAgents === 1 ? "is" : "are"} moving under governed command.` : "Command is quiet but standing by.",
      metric: `${enabledAgents} enabled agent${enabledAgents === 1 ? "" : "s"}`,
      summary: pendingApprovals > 0 ? "Ambient intelligence is routing work through approvals." : "Ambient intelligence, approvals, and operator command converge here.",
    },
    {
      ...DISTRICTS["agency"],
      status: movingAgents > 0 ? "active" : enabledAgents > 0 ? "ready" : "idle",
      signal: movingAgents > 0 ? `${movingAgents} active field movement${movingAgents === 1 ? "" : "s"} started from the registry.` : "No field movement has started from the agency yet.",
      metric: `${enabledAgents} registered worker${enabledAgents === 1 ? "" : "s"}`,
      summary: db.agents?.[0]?.description || "Registry, staffing, and operating instructions live here.",
    },
    {
      ...DISTRICTS["work-yards"],
      status: activeTasks > 0 ? "active" : completedTasks > 0 ? "ready" : "idle",
      signal: activeTasks > 0 ? `${activeTasks} work order${activeTasks === 1 ? "" : "s"} are currently in motion.` : completedTasks > 0 ? `${completedTasks} completed work order${completedTasks === 1 ? "" : "s"} left fresh output behind.` : "No work orders are currently moving.",
      metric: `${completedTasks} completed · ${db.tasks.length} total`,
      summary: db.tasks[0]?.title || "Execution queues, outputs, and operating throughput gather here.",
    },
    {
      ...DISTRICTS["archive"],
      status: evidenceCount > 0 ? "active" : (db.settings ? 1 : 0) > 0 ? "ready" : "idle",
      signal: evidenceCount > 0 ? `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"} are now traceable in the city.` : "The archive is waiting for the next evidence trail.",
      metric: `${evidenceCount} evidence trail item${evidenceCount === 1 ? "" : "s"}`,
      summary: "Settings, decisions, runs, and proof accumulate into long-horizon memory here.",
    },
    {
      ...DISTRICTS["quarters"],
      status: lifestyleSignals > 0 ? "active" : db.lifestyle.length ? "ready" : "idle",
      signal: lifestyleSignals > 0 ? `${lifestyleSignals} personal infrastructure signal${lifestyleSignals === 1 ? "" : "s"} are protecting executive capacity.` : "The quarters are calm right now.",
      metric: `${db.lifestyle.length} lifestyle systems`,
      summary: db.lifestyle[0]?.note || "Personal infrastructure stays visible instead of disappearing behind utility screens.",
    },
  ];

  const activeDistrictIds = districts.filter((district) => district.status === "active").map((district) => district.id);
  const primaryTarget = detectPrimaryTarget(db, activeDistrictIds);
  const primarySteps: CityJourneyStep[] = enabledAgents > 0 ? [
    { from: "agency", to: "governors-office", label: "Agency dispatch", tone: "running" },
    { from: "governors-office", to: primaryTarget, label: `Routed to ${DISTRICTS[primaryTarget].label}`, tone: "running" },
  ] : [];

  if (pendingApprovals > 0 && primarySteps.length > 0 && primaryTarget !== "council-chamber") {
    primarySteps.push({ from: primaryTarget, to: "council-chamber", label: "Approval required", tone: "approval" });
  }
  if (evidenceCount > 0 && primarySteps.length > 0) {
    primarySteps.push({
      from: primarySteps[primarySteps.length - 1]?.to ?? primaryTarget,
      to: "archive",
      label: "Evidence logged",
      tone: "evidence",
    });
  }

  const presences: CityPresence[] = primarySteps.length > 0
    ? [{
        id: "operations-presence",
        label: `Operations relay → ${DISTRICTS[primaryTarget].label}`,
        district: primaryTarget,
        status: pendingApprovals > 0 ? "approval route engaged" : evidenceCount > 0 ? "evidence route engaged" : "field movement active",
        steps: primarySteps,
      }]
    : enabledAgents > 0
      ? [{
          id: "watch-presence",
          label: "Agency watch",
          district: "governors-office",
          status: "governor circuit",
          steps: [{ from: "agency", to: "governors-office", label: "Standing watch", tone: "running" }],
        }]
      : [];

  const activeCount = activeDistrictIds.length;
  const headline = activeCount > 0
    ? `${activeCount} district${activeCount === 1 ? "" : "s"} are active across the city`
    : "The city is calm and ready for the next move";
  const briefing = [
    newLeads > 0 ? "Arrivals Hall is lit by new inbound requests." : null,
    activeOpportunities > 0 ? "The Exchange is moving active deal flow." : null,
    readyContent > 0 ? "Broadcast Tower is broadcasting ready or published content." : null,
    pendingApprovals > 0 ? "Council Chamber is awaiting governed approval." : null,
    evidenceCount > 0 ? "The Archive is absorbing fresh proof and history." : null,
  ].filter(Boolean).join(" ");

  return {
    headline,
    briefing: briefing || "Districts are prepared to light up as soon as work, approvals, and evidence begin to move.",
    districts,
    activeDistrictIds,
    activeCount,
    pendingApprovals,
    evidenceCount,
    movingAgents,
    presences,
  };
}
