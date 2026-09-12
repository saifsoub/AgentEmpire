import { describe, expect, it } from "vitest";
import { executionModeDescription, providerAllowed, resolveExecutionMode } from "@/lib/tools/execution-policy";

describe("control-plane execution policy", () => {
  it("defaults missing and invalid mode values to inspect", () => {
    expect(resolveExecutionMode(undefined)).toBe("inspect");
    expect(resolveExecutionMode("live")).toBe("inspect");
    expect(resolveExecutionMode("inspect")).toBe("inspect");
  });

  it("blocks every provider in inspect mode", () => {
    for (const provider of ["native", "composio", "mcp", "webhook", "manual"] as const) {
      expect(providerAllowed(provider, "inspect")).toBe(false);
    }
  });

  it("allows only repository-owned internal providers in internal mode", () => {
    expect(providerAllowed("native", "internal")).toBe(true);
    expect(providerAllowed("manual", "internal")).toBe(true);
    expect(providerAllowed("composio", "internal")).toBe(false);
    expect(providerAllowed("mcp", "internal")).toBe(false);
    expect(providerAllowed("webhook", "internal")).toBe(false);
  });

  it("allows configured provider dispatch only in external mode", () => {
    for (const provider of ["native", "composio", "mcp", "webhook", "manual"] as const) {
      expect(providerAllowed(provider, "external")).toBe(true);
    }
  });

  it("documents the non-mutating default and gated external boundary", () => {
    expect(executionModeDescription("inspect")).toContain("No provider execution");
    expect(executionModeDescription("external")).toContain("owner approval token");
  });
});
