export type CommandGroup = "Command" | "Work" | "Intelligence" | "Services";

export type CommandItem = {
  id: string;
  label: string;
  href: string;
  group: CommandGroup;
  description: string;
  keywords: string[];
};

export const COMMAND_ITEMS: CommandItem[] = [
  { id: "control", label: "Control", href: "/control", group: "Command", description: "Health, exceptions, approvals, and current work", keywords: ["command", "health", "exceptions"] },
  { id: "city", label: "S/ City", href: "/city", group: "Command", description: "Spatial operating overview", keywords: ["overview", "map"] },
  { id: "opportunities", label: "Opportunities", href: "/opportunities", group: "Work", description: "Pipeline and next moves", keywords: ["exchange", "pipeline"] },
  { id: "offers", label: "Offers", href: "/offers", group: "Work", description: "Offer packaging and commercial readiness", keywords: ["marketplace", "pricing"] },
  { id: "decisions", label: "Decisions", href: "/decisions", group: "Work", description: "Options, evidence, and recommendations", keywords: ["council", "approval"] },
  { id: "tasks", label: "Tasks", href: "/tasks", group: "Work", description: "Assigned and blocked execution", keywords: ["work", "yards"] },
  { id: "agents", label: "Agents", href: "/agents", group: "Intelligence", description: "Registry, tools, runs, and approvals", keywords: ["agency", "registry", "workers"] },
  { id: "briefings", label: "Briefings", href: "/briefings", group: "Intelligence", description: "Executive operating briefs", keywords: ["weekly", "council"] },
  { id: "content", label: "Content", href: "/content", group: "Intelligence", description: "Content operations", keywords: ["broadcast", "publishing"] },
  { id: "assets", label: "Assets", href: "/assets", group: "Intelligence", description: "Reusable evidence and products", keywords: ["files", "archive", "factory"] },
  { id: "leads", label: "Leads", href: "/leads", group: "Work", description: "Inbound demand and follow-up", keywords: ["arrivals", "crm"] },
  { id: "lifestyle", label: "Lifestyle", href: "/lifestyle", group: "Services", description: "Personal operating environment", keywords: ["quarters", "personal"] },
  { id: "university", label: "S/ University", href: "/city/university", group: "Services", description: "Agent education and certification", keywords: ["training", "skills"] },
  { id: "banking", label: "S/ Banking", href: "/city/banking", group: "Services", description: "Owner-gated wallets and transfers", keywords: ["finance", "payment", "wallet"] },
  { id: "settings", label: "Settings", href: "/settings", group: "Services", description: "Operator preferences", keywords: ["configuration", "archive"] },
];

export const NAVIGATION_GROUPS: Array<{ label: CommandGroup; items: CommandItem[] }> = (
  ["Command", "Work", "Intelligence", "Services"] as const
).map((label) => ({ label, items: COMMAND_ITEMS.filter((item) => item.group === label) }));

export function getShellMode(width: number): "mobile" | "desktop" {
  return Number.isFinite(width) && width >= 1024 ? "desktop" : "mobile";
}

export function isCommandPaletteShortcut(event: {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}): boolean {
  return event.key.toLowerCase() === "k"
    && (event.metaKey || event.ctrlKey)
    && !event.altKey
    && !event.shiftKey;
}

export function nextCommandIndex(current: number, key: string, count: number): number {
  if (count <= 0) return -1;
  if (key === "ArrowDown") return (Math.max(current, -1) + 1) % count;
  if (key === "ArrowUp") return current <= 0 ? count - 1 : current - 1;
  return current;
}

export function filterCommands(query: string): CommandItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return COMMAND_ITEMS;
  return COMMAND_ITEMS.filter((item) => [
    item.label,
    item.description,
    item.group,
    ...item.keywords,
  ].some((value) => value.toLowerCase().includes(normalized)));
}
