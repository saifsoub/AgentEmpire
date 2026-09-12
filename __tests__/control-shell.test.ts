import { describe, expect, it } from "vitest";
import {
  COMMAND_ITEMS,
  filterCommands,
  getShellMode,
  isCommandPaletteShortcut,
  nextCommandIndex,
} from "@/lib/control-plane/navigation";

describe("canonical control shell contracts", () => {
  it.each([
    [320, "mobile"],
    [768, "mobile"],
    [1024, "desktop"],
    [1440, "desktop"],
  ] as const)("uses the accessible navigation mode at %ipx", (width, expected) => {
    expect(getShellMode(width)).toBe(expected);
  });

  it("opens the command palette for Control-K on macOS and Windows/Linux", () => {
    expect(isCommandPaletteShortcut({ key: "k", metaKey: true, ctrlKey: false, altKey: false, shiftKey: false })).toBe(true);
    expect(isCommandPaletteShortcut({ key: "K", metaKey: false, ctrlKey: true, altKey: false, shiftKey: false })).toBe(true);
    expect(isCommandPaletteShortcut({ key: "k", metaKey: false, ctrlKey: false, altKey: false, shiftKey: false })).toBe(false);
  });

  it("wraps arrow-key selection and leaves other keys unchanged", () => {
    expect(nextCommandIndex(0, "ArrowUp", 3)).toBe(2);
    expect(nextCommandIndex(2, "ArrowDown", 3)).toBe(0);
    expect(nextCommandIndex(1, "Tab", 3)).toBe(1);
    expect(nextCommandIndex(-1, "ArrowDown", 0)).toBe(-1);
  });

  it("keeps every routine operator route reachable from the palette", () => {
    expect(COMMAND_ITEMS.map((item) => item.href)).toEqual(expect.arrayContaining([
      "/control", "/city", "/opportunities", "/offers", "/decisions", "/tasks",
      "/agents", "/briefings", "/content", "/assets", "/leads", "/lifestyle",
      "/city/university", "/city/banking", "/settings",
    ]));
    expect(new Set(COMMAND_ITEMS.map((item) => item.href)).size).toBe(COMMAND_ITEMS.length);
  });

  it("filters commands by labels, descriptions, groups, and operator keywords", () => {
    expect(filterCommands("wallet").map((item) => item.href)).toEqual(["/city/banking"]);
    expect(filterCommands("exception").map((item) => item.href)).toEqual(["/control"]);
    expect(filterCommands("  ")).toHaveLength(COMMAND_ITEMS.length);
  });
});
