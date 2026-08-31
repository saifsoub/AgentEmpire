import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/layout/app-shell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("AppShell accessible markup", () => {
  it("keeps skip navigation, desktop rail, mobile drawer trigger, palette trigger, and main landmark available", () => {
    const html = renderToStaticMarkup(React.createElement(
      AppShell,
      {
        pathname: "/control",
        title: "Control",
        subtitle: "Current operating truth",
        children: React.createElement("p", null, "Exceptions"),
      },
    ));

    expect(html).toContain('href="#main-content"');
    expect(html).toContain("Skip to content");
    expect(html).toContain('aria-label="Primary navigation"');
    expect(html).toContain('aria-controls="mobile-navigation"');
    expect(html).toContain('aria-label="Open command palette"');
    expect(html).toContain('id="main-content"');
    expect(html).toContain("Production cutover owner-gated");
    expect(html).toContain("Control data unavailable");
  });

  it("renders error health as explicit text rather than color alone", () => {
    const html = renderToStaticMarkup(React.createElement(
      AppShell,
      {
        pathname: "/control",
        title: "Control",
        subtitle: "Current operating truth",
        health: { state: "error", label: "Exceptions require attention", detail: "2 critical exceptions" },
        children: React.createElement("p", null, "Exceptions"),
      },
    ));

    expect(html).toContain("Exceptions require attention");
    expect(html).toContain("2 critical exceptions");
  });
});
