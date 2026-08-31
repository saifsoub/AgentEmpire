export type AuditDisposition = "keep" | "merge" | "retire";

export type RouteAuditEntry = {
  route: string;
  sourcePath: string;
  disposition: AuditDisposition;
  dataOwner: string;
  rationale: string;
  operatorFacing: boolean;
  destination?: string;
  planned?: boolean;
};

export type ApiAuditEntry = {
  route: string;
  sourcePath: string;
  methods: readonly string[];
  disposition: AuditDisposition;
  dataOwner: string;
  rationale: string;
  destination?: string;
};

export type ComponentAuditEntry = {
  component: string;
  canonicalPath: `components/${string}`;
  retirePaths: readonly string[];
  rationale: string;
};

export type DonorDisposition = "accept" | "reject" | "unavailable";

export type DonorEvidenceEntry = {
  donor: string;
  evidenceUrl: string;
  disposition: DonorDisposition;
  components: readonly string[];
  basis: string;
  operatorFacing: false;
  blocksCp02: boolean;
};

export const CANONICAL_OPERATOR_APP = {
  repository: "saifsoub/AgentEmpire",
  route: "/control",
} as const;

/**
 * Page-level decisions for the current App Router, including the implemented CP-02 route.
 * A merge/retire decision is a migration target, not permission to remove a route
 * before its replacement journey has test evidence.
 */
export const ROUTE_AUDIT: readonly RouteAuditEntry[] = [
  {
    route: "/control",
    sourcePath: "app/control/page.tsx",
    disposition: "keep",
    dataOwner: "read-only lib/store.ts evidence projected by lib/control-plane/snapshot.ts",
    rationale: "Implemented CP-02 canonical operator command center.",
    operatorFacing: true,
  },
  {
    route: "/",
    sourcePath: "app/page.tsx",
    disposition: "keep",
    dataOwner: "Next.js routing",
    rationale: "Keep one repository entry point; its eventual redirect target is /control.",
    operatorFacing: true,
    destination: "/control",
  },
  {
    route: "/a/[id]",
    sourcePath: "app/a/[id]/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts assets and leads",
    rationale: "Public asset detail and lead-capture journey, not a competing operator shell.",
    operatorFacing: false,
  },
  {
    route: "/agents",
    sourcePath: "app/agents/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts agents, runs, approvals; lib/agents/definitions.ts",
    rationale: "Canonical detailed registry and run-management surface behind /control summaries.",
    operatorFacing: true,
  },
  {
    route: "/assets",
    sourcePath: "app/assets/page.tsx",
    disposition: "merge",
    dataOwner: "lib/store.ts assets",
    rationale: "Keep reachable until CP-07 merges assets into the evidence workspace.",
    operatorFacing: true,
    destination: "/files",
  },
  {
    route: "/briefings",
    sourcePath: "app/briefings/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts briefings",
    rationale: "Detailed briefing history remains useful beneath the /control overview.",
    operatorFacing: true,
  },
  {
    route: "/city",
    sourcePath: "app/city/page.tsx",
    disposition: "keep",
    dataOwner: "components/city/* and current domain APIs",
    rationale: "Preserve the spatial operating overview inside the canonical shell.",
    operatorFacing: true,
  },
  {
    route: "/city/banking",
    sourcePath: "app/city/banking/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts wallets/transactions; lib/city-banking.ts",
    rationale: "Keep the owner-gated finance service as a detailed operational route.",
    operatorFacing: true,
  },
  {
    route: "/city/university",
    sourcePath: "app/city/university/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts enrollments; lib/city-university.ts",
    rationale: "Keep the agent education and certification stream linked from control.",
    operatorFacing: true,
  },
  {
    route: "/content",
    sourcePath: "app/content/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts content",
    rationale: "Retain the detailed content workspace and surface only exceptions in /control.",
    operatorFacing: true,
  },
  {
    route: "/dashboard",
    sourcePath: "app/dashboard/page.tsx",
    disposition: "merge",
    dataOwner: "Next.js routing",
    rationale: "Preserve the existing /city redirect; changing the default journey is a separate owner-gated cutover decision.",
    operatorFacing: true,
    destination: "/city",
  },
  {
    route: "/decisions",
    sourcePath: "app/decisions/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts decisions",
    rationale: "Keep the decision record workspace and link its exceptions from /control.",
    operatorFacing: true,
  },
  {
    route: "/leads",
    sourcePath: "app/leads/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts leads and source entities",
    rationale: "Keep inbound demand and follow-up as a detailed work surface.",
    operatorFacing: true,
  },
  {
    route: "/lifestyle",
    sourcePath: "app/lifestyle/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts lifestyle goals",
    rationale: "Keep the personal operating slice as a service in the canonical shell.",
    operatorFacing: true,
  },
  {
    route: "/o/[id]",
    sourcePath: "app/o/[id]/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts offers and leads",
    rationale: "Public offer and lead-capture journey, not a competing operator shell.",
    operatorFacing: false,
  },
  {
    route: "/offers",
    sourcePath: "app/offers/page.tsx",
    disposition: "merge",
    dataOwner: "lib/store.ts offers",
    rationale: "Keep reachable until CP-04 folds offers into project workspaces.",
    operatorFacing: true,
    destination: "/projects",
  },
  {
    route: "/opportunities",
    sourcePath: "app/opportunities/page.tsx",
    disposition: "merge",
    dataOwner: "lib/store.ts opportunities",
    rationale: "Keep reachable until CP-04 folds pipeline state into project workspaces.",
    operatorFacing: true,
    destination: "/projects",
  },
  {
    route: "/settings",
    sourcePath: "app/settings/page.tsx",
    disposition: "keep",
    dataOwner: "lib/store.ts settings",
    rationale: "Canonical operator preferences remain a dedicated route.",
    operatorFacing: true,
  },
  {
    route: "/superpowers",
    sourcePath: "app/superpowers/page.tsx",
    disposition: "retire",
    dataOwner: "Next.js routing; legacy lib/store.ts superpower projection",
    rationale: "The page is already a redirect; agent capabilities belong in /agents.",
    operatorFacing: true,
    destination: "/agents",
  },
  {
    route: "/tasks",
    sourcePath: "app/tasks/page.tsx",
    disposition: "merge",
    dataOwner: "lib/store.ts tasks",
    rationale: "Keep reachable until CP-04 folds execution into project workspaces.",
    operatorFacing: true,
    destination: "/projects",
  },
  {
    route: "/uae-car-sales",
    sourcePath: "app/uae-car-sales/page.tsx",
    disposition: "retire",
    dataOwner: "Next.js routing; legacy UAE car-sales agent",
    rationale: "The page is already a redirect; the reusable offer flow lives at /offers.",
    operatorFacing: true,
    destination: "/offers",
  },
] as const;

export const API_AUDIT: readonly ApiAuditEntry[] = [
  { route: "/api/admin/cleanup-tasks", sourcePath: "app/api/admin/cleanup-tasks/route.ts", methods: ["POST"], disposition: "keep", dataOwner: "lib/store.ts task maintenance", rationale: "Retain as an internal maintenance command; production exposure requires authorization." },
  { route: "/api/agent-runs", sourcePath: "app/api/agent-runs/route.ts", methods: ["GET"], disposition: "keep", dataOwner: "lib/store.ts agent runs", rationale: "Supplies run history to agents and /control." },
  { route: "/api/agent/uae-car-sales", sourcePath: "app/api/agent/uae-car-sales/route.ts", methods: ["POST"], disposition: "merge", dataOwner: "Anthropic adapter, skills/uae-car-sales, lib/store.ts offers", rationale: "Fold the domain-specific runner into the typed agent execution boundary.", destination: "/api/agents/run" },
  { route: "/api/agents/[id]", sourcePath: "app/api/agents/[id]/route.ts", methods: ["PATCH", "DELETE"], disposition: "keep", dataOwner: "lib/store.ts agents", rationale: "Canonical agent configuration mutation boundary." },
  { route: "/api/agents", sourcePath: "app/api/agents/route.ts", methods: ["GET", "POST"], disposition: "keep", dataOwner: "lib/store.ts agents", rationale: "Canonical agent registry collection boundary." },
  { route: "/api/agents/run", sourcePath: "app/api/agents/run/route.ts", methods: ["POST"], disposition: "keep", dataOwner: "lib/tools/router.ts and lib/store.ts run/approval records", rationale: "Existing provider execution path is not dry-run-enforced; CP-02 does not invoke it and CP-03 must govern it before production use." },
  { route: "/api/approvals/[id]", sourcePath: "app/api/approvals/[id]/route.ts", methods: ["PATCH"], disposition: "keep", dataOwner: "lib/store.ts approvals", rationale: "Canonical approval-decision mutation boundary." },
  { route: "/api/approvals", sourcePath: "app/api/approvals/route.ts", methods: ["GET", "POST"], disposition: "keep", dataOwner: "lib/store.ts approvals", rationale: "Supplies the owner-gated approval queue." },
  { route: "/api/assets", sourcePath: "app/api/assets/route.ts", methods: ["POST"], disposition: "merge", dataOwner: "lib/store.ts assets", rationale: "Keep until CP-07 provides the artifact/evidence contract.", destination: "/api/artifacts" },
  { route: "/api/banking", sourcePath: "app/api/banking/route.ts", methods: ["GET"], disposition: "keep", dataOwner: "lib/store.ts wallets/transactions; lib/city-banking.ts", rationale: "Read model for owner-gated banking operations." },
  { route: "/api/banking/transactions/[id]", sourcePath: "app/api/banking/transactions/[id]/route.ts", methods: ["PATCH"], disposition: "keep", dataOwner: "lib/store.ts wallet transactions", rationale: "Owner-gated transaction resolution boundary." },
  { route: "/api/banking/transactions", sourcePath: "app/api/banking/transactions/route.ts", methods: ["POST"], disposition: "keep", dataOwner: "lib/store.ts wallet transactions", rationale: "Transaction request boundary; sensitive execution remains approval-gated." },
  { route: "/api/banking/wallets/[id]", sourcePath: "app/api/banking/wallets/[id]/route.ts", methods: ["PATCH"], disposition: "keep", dataOwner: "lib/store.ts wallets", rationale: "Wallet status mutation boundary." },
  { route: "/api/banking/wallets", sourcePath: "app/api/banking/wallets/route.ts", methods: ["POST"], disposition: "keep", dataOwner: "lib/store.ts wallets", rationale: "Wallet creation boundary." },
  { route: "/api/briefings/generate", sourcePath: "app/api/briefings/generate/route.ts", methods: ["POST"], disposition: "keep", dataOwner: "lib/store.ts briefings", rationale: "Brief generation command used by the detailed and control surfaces." },
  { route: "/api/content", sourcePath: "app/api/content/route.ts", methods: ["POST"], disposition: "keep", dataOwner: "lib/store.ts content", rationale: "Content creation boundary." },
  { route: "/api/decisions", sourcePath: "app/api/decisions/route.ts", methods: ["POST"], disposition: "keep", dataOwner: "lib/store.ts decisions and scoring", rationale: "Decision analysis boundary retained for CP-04 enrichment." },
  { route: "/api/leads", sourcePath: "app/api/leads/route.ts", methods: ["POST"], disposition: "keep", dataOwner: "lib/store.ts leads", rationale: "Lead capture boundary shared by public detail routes." },
  { route: "/api/linear-webhook", sourcePath: "app/api/linear-webhook/route.ts", methods: ["POST"], disposition: "merge", dataOwner: "lib/agents/runner.ts, Anthropic, Composio/Linear", rationale: "Keep until CP-03 moves external execution behind the governed S-OS adapter.", destination: "/api/integrations/linear" },
  { route: "/api/offers", sourcePath: "app/api/offers/route.ts", methods: ["POST"], disposition: "merge", dataOwner: "lib/store.ts offers", rationale: "Keep until CP-04 introduces the project workspace contract.", destination: "/api/projects" },
  { route: "/api/opportunities", sourcePath: "app/api/opportunities/route.ts", methods: ["POST"], disposition: "merge", dataOwner: "lib/store.ts opportunities", rationale: "Keep until CP-04 introduces the project workspace contract.", destination: "/api/projects" },
  { route: "/api/settings", sourcePath: "app/api/settings/route.ts", methods: ["GET", "POST"], disposition: "keep", dataOwner: "lib/store.ts settings", rationale: "Canonical preferences boundary." },
  { route: "/api/superpowers", sourcePath: "app/api/superpowers/route.ts", methods: ["POST"], disposition: "merge", dataOwner: "lib/store.ts plus Groq adapter", rationale: "Unify legacy superpower execution with the canonical agent runner.", destination: "/api/agents/run" },
  { route: "/api/tasks", sourcePath: "app/api/tasks/route.ts", methods: ["GET", "POST", "PATCH"], disposition: "merge", dataOwner: "lib/store.ts tasks", rationale: "Keep until CP-04 introduces project-scoped work items.", destination: "/api/projects" },
  { route: "/api/tools/discover", sourcePath: "app/api/tools/discover/route.ts", methods: ["POST"], disposition: "keep", dataOwner: "lib/agents/definitions.ts plus MCP/Composio configuration", rationale: "Canonical tool discovery projection for the agent registry." },
  { route: "/api/tools/status", sourcePath: "app/api/tools/status/route.ts", methods: ["GET"], disposition: "keep", dataOwner: "lib/tools/providers.ts and provider configuration", rationale: "Supplies provider readiness and explicit unavailable state." },
  { route: "/api/university/[id]", sourcePath: "app/api/university/[id]/route.ts", methods: ["PATCH"], disposition: "keep", dataOwner: "lib/store.ts university enrollments", rationale: "Enrollment progression and exam boundary." },
  { route: "/api/university", sourcePath: "app/api/university/route.ts", methods: ["GET", "POST"], disposition: "keep", dataOwner: "lib/store.ts enrollments; lib/city-university.ts catalog", rationale: "University catalog and enrollment boundary." },
] as const;

export const COMPONENT_AUDIT: readonly ComponentAuditEntry[] = [
  { component: "AppShell", canonicalPath: "components/layout/app-shell.tsx", retirePaths: ["app-shell.tsx"], rationale: "All App Router pages import the feature-scoped shell." },
  { component: "Sidebar", canonicalPath: "components/layout/sidebar.tsx", retirePaths: ["sidebar.tsx"], rationale: "Navigation belongs beside the canonical shell." },
  { component: "BarMeter", canonicalPath: "components/bar-meter.tsx", retirePaths: ["bar-meter.tsx"], rationale: "The components/ copy is byte-identical and is the imported path." },
  { component: "QuickCreate", canonicalPath: "components/quick-create.tsx", retirePaths: ["quick-create.tsx"], rationale: "The components/ copy is byte-identical and is the imported path." },
  { component: "RefreshBriefButton", canonicalPath: "components/refresh-brief.tsx", retirePaths: ["refresh-brief.tsx"], rationale: "The components/ copy is byte-identical and is the imported path." },
  { component: "SectionCard", canonicalPath: "components/section-card.tsx", retirePaths: ["section-card.tsx"], rationale: "The components/ copy is byte-identical and is the imported path." },
  { component: "StatCard", canonicalPath: "components/stat-card.tsx", retirePaths: ["stat-card.tsx"], rationale: "Keep one canonical reusable card even though both copies are currently unused." },
  { component: "OpportunitiesTable", canonicalPath: "components/table.tsx", retirePaths: ["table.tsx"], rationale: "The components/ copy is byte-identical and is the imported path." },
  { component: "UI primitives", canonicalPath: "components/ui.tsx", retirePaths: ["ui.tsx"], rationale: "The components/ copy is byte-identical and is the imported path." },
] as const;

export const DONOR_EVIDENCE: readonly DonorEvidenceEntry[] = [
  {
    donor: "OUTS-80 S/Agency HTML template — reusable interaction and visual concepts",
    evidenceUrl: "https://linear.app/seifs88/issue/OUTS-80/sagency-control-panel-front-end-suggested-design-template",
    disposition: "accept",
    components: ["status vocabulary", "team/agent card hierarchy", "mention-target switcher", "command composer structure"],
    basis: "Inspectable issue attachment supplies the original single-file prototype.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "OUTS-80 S/Agency HTML template — unsafe prototype shell",
    evidenceUrl: "https://linear.app/seifs88/issue/OUTS-80/sagency-control-panel-front-end-suggested-design-template",
    disposition: "reject",
    components: ["standalone document shell", "CDN Tailwind", "inline handlers", "unsafe-eval CSP", "synthetic totals/actions", "fixed viewport dock"],
    basis: "Prototype-only implementation conflicts with repository, accessibility, and operational-truth requirements.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "PR #38 — API-derived control-panel modules",
    evidenceUrl: "https://github.com/saifsoub/AgentEmpire/pull/38",
    disposition: "accept",
    components: ["API-derived StatTile", "AgentCard", "pending-approval queue", "responsive grids", "local design-token concept"],
    basis: "Verified draft head eef2a144c4613c486965d769f6ab9136cba25318 changes five files and demonstrates these reusable concepts; it adds no tests.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "PR #38 — root-shell and dependency churn",
    evidenceUrl: "https://github.com/saifsoub/AgentEmpire/pull/38",
    disposition: "reject",
    components: ["root layout.tsx duplicate", "root globals.css edits", "remote Google font", "package-lock churn", "wholesale branch merge"],
    basis: "The five-file draft edits legacy root paths, introduces a remote font, and has no test evidence.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "PR #34 — audit and heartbeat contract concepts",
    evidenceUrl: "https://github.com/saifsoub/AgentEmpire/pull/34",
    disposition: "accept",
    components: ["approval-to-audit linkage concept", "agent heartbeat/readiness concept", "task-filtered audit query concept"],
    basis: "Verified draft head 57d3c60586281aa4d75281a5ec91219a7fee041b changes seven files; concepts are useful but require a new typed, authenticated, durable implementation.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "PR #34 — draft persistence implementation",
    evidenceUrl: "https://github.com/saifsoub/AgentEmpire/pull/34",
    disposition: "reject",
    components: ["unauthenticated audit POST", "silent file-write failure", "non-transactional approval/audit writes", "500-entry destructive cap", "wholesale branch merge"],
    basis: "The draft changes no test file and does not provide production-grade audit persistence or authorization evidence.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "PR #30 — typed city adapter and district information architecture",
    evidenceUrl: "https://github.com/saifsoub/AgentEmpire/pull/30",
    disposition: "accept",
    components: ["typed city-state adapter boundary", "district information architecture", "state-derived district signals"],
    basis: "Verified draft head 1795a0a3ec298845a6ed1e2d16046982d68c1788 changes nineteen files and includes focused city-state tests.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "PR #30 — city-first shell replacement",
    evidenceUrl: "https://github.com/saifsoub/AgentEmpire/pull/30",
    disposition: "reject",
    components: ["city as the primary application shell", "wholesale route reframing", "wholesale branch merge"],
    basis: "The useful adapter and IA can be ported without displacing the approved /control canonical entry point.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "S-OS runtime and governance contracts",
    evidenceUrl: "https://github.com/saifsoub/S-OS",
    disposition: "accept",
    components: ["command envelope", "agent registry contract", "approval policy", "audit/run semantics"],
    basis: "Use as a server-side contract donor behind AgentEmpire APIs, never as another operator destination.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "SEI-238 — component source/export",
    evidenceUrl: "https://linear.app/seifs88/issue/SEI-238/shape-s-control-v1-front-and-settings-copy",
    disposition: "unavailable",
    components: [],
    basis: "Issue metadata is traceable, but no inspectable source export, screenshot, or implementation permalink is attached for component intake.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "DONEAI-66 — component source/export",
    evidenceUrl: "https://linear.app/seifs88/issue/DONEAI-66/create-html-executive-control-surface-artifact",
    disposition: "unavailable",
    components: [],
    basis: "Issue metadata is traceable, but no inspectable source export, screenshot, or implementation permalink is attached for component intake.",
    operatorFacing: false,
    blocksCp02: false,
  },
  {
    donor: "SAG-2 — component/data-model source export",
    evidenceUrl: "https://linear.app/seifs88/issue/SAG-2/team-operating-system",
    disposition: "unavailable",
    components: [],
    basis: "Issue metadata is traceable, but no bounded UI or data-contract export is attached for this consolidation intake.",
    operatorFacing: false,
    blocksCp02: false,
  },
] as const;

const PLANNED_PAGE_ROUTES = new Set(
  ROUTE_AUDIT.filter((entry) => entry.planned).map((entry) => entry.route),
);

function normalizeRoute(route: string): string {
  const withLeadingSlash = route.startsWith("/") ? route : `/${route}`;
  const withoutTrailingSlash = withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, "")
    : withLeadingSlash;
  return withoutTrailingSlash || "/";
}

export function routePathFromFile(filePath: string): string {
  const parts = filePath.replace(/\\/g, "/").split("/").filter(Boolean);
  const appIndex = parts.lastIndexOf("app");
  const filename = parts.at(-1);

  if (appIndex < 0 || (filename !== "page.tsx" && filename !== "route.ts")) {
    throw new TypeError(`Expected an App Router page.tsx or route.ts path, received: ${filePath}`);
  }

  const routeParts = parts
    .slice(appIndex + 1, -1)
    .filter((part) => !(part.startsWith("(") && part.endsWith(")")))
    .filter((part) => !part.startsWith("@"))
    .map((part) => part.replace(/^(?:\(\.\.\.\)|\(\.\.\)|\(\.\))+/, ""))
    .filter(Boolean);

  return routeParts.length === 0 ? "/" : `/${routeParts.join("/")}`;
}

export function auditCoverage(
  discoveredRoutes: readonly string[],
  auditedRoutes: readonly string[],
): { missing: string[]; stale: string[] } {
  const discovered = new Set(discoveredRoutes.map(normalizeRoute));
  const audited = new Set(auditedRoutes.map(normalizeRoute));

  return {
    missing: [...discovered].filter((route) => !audited.has(route)).sort(),
    stale: [...audited]
      .filter((route) => !discovered.has(route) && !PLANNED_PAGE_ROUTES.has(route))
      .sort(),
  };
}
