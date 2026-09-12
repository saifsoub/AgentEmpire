import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  API_AUDIT,
  CANONICAL_OPERATOR_APP,
  COMPONENT_AUDIT,
  DONOR_EVIDENCE,
  ROUTE_AUDIT,
  auditCoverage,
  routePathFromFile,
} from "@/lib/control-plane/inventory";

function findFiles(root: string, filename: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return findFiles(absolute, filename);
    return entry.name === filename ? [path.relative(process.cwd(), absolute)] : [];
  });
}

describe("control-plane audit coverage", () => {
  it("fails when an application page or API route has no keep/merge/retire decision", () => {
    const discoveredPages = findFiles(path.join(process.cwd(), "app"), "page.tsx").map(routePathFromFile);
    const discoveredApis = findFiles(path.join(process.cwd(), "app"), "route.ts").map(routePathFromFile);

    expect(auditCoverage(discoveredPages, ROUTE_AUDIT.map((item) => item.route))).toEqual({ missing: [], stale: [] });
    expect(auditCoverage(discoveredApis, API_AUDIT.map((item) => item.route))).toEqual({ missing: [], stale: [] });
  });

  it("keeps AgentEmpire as the only operator-facing application", () => {
    expect(CANONICAL_OPERATOR_APP).toEqual({ repository: "saifsoub/AgentEmpire", route: "/control" });
    expect(ROUTE_AUDIT.find((entry) => entry.route === "/control")?.planned).not.toBe(true);
    expect(DONOR_EVIDENCE.filter((donor) => donor.operatorFacing)).toHaveLength(0);
  });

  it("records traceable donor evidence without making unavailable references blockers", () => {
    for (const donor of DONOR_EVIDENCE) {
      expect(donor.evidenceUrl).toMatch(/^https:\/\//);
      expect(["accept", "reject", "unavailable"]).toContain(donor.disposition);
      if (donor.disposition === "unavailable") expect(donor.blocksCp02).toBe(false);
    }
  });

  it("chooses one canonical component for every audited duplicate", () => {
    for (const duplicate of COMPONENT_AUDIT) {
      expect(duplicate.canonicalPath).toMatch(/^components\//);
      expect(duplicate.retirePaths).not.toContain(duplicate.canonicalPath);
      expect(duplicate.retirePaths.length).toBeGreaterThan(0);
    }
  });
});
