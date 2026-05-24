export type ToolProviderName = "composio" | "native" | "mcp" | "webhook" | "manual";

export type AgentCapability =
  | "content.strategy"
  | "opportunity.score"
  | "decision.advise"
  | "lead.qualify"
  | "asset.build"
  | "market.pulse"
  | "task.create"
  | "briefing.create"
  | "email.draft"
  | "calendar.create"
  | "github.issue.create";

export interface AgentInputField {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "select";
  options?: string[];
}

export interface AgentDefinition {
  id: string;
  name: string;
  category: "Content" | "Revenue" | "Strategy" | "Assets";
  description: string;
  systemPrompt: string;
  inputFields: AgentInputField[];
  capabilities: AgentCapability[];
  preferredProviders: ToolProviderName[];
  outputRoutes: Array<"tasks" | "briefings" | "leads" | "content" | "assets" | "decisions">;
  approvalPolicy: string[];
}

export const APPROVAL_SENSITIVE_ACTIONS = [
  "external_send",
  "publish",
  "payment",
  "commitment",
  "delete",
  "spend_money"
];

export const BUILT_IN_AGENTS: AgentDefinition[] = [
  {
    id: "content-strategist",
    name: "Content Strategist",
    category: "Content",
    description: "Turns a topic into an executive content angle, hook, post structure, and next publishing action.",
    systemPrompt: "You are a practical executive content strategist. Produce direct, high-value content direction with a clear next action.",
    inputFields: [
      { key: "pillar", label: "Content Pillar", placeholder: "AI transformation, government excellence, revenue systems" },
      { key: "topic", label: "Topic Focus", placeholder: "What should the content be about?" },
      { key: "platform", label: "Platform", type: "select", options: ["LinkedIn", "X", "Newsletter", "Instagram"] },
      { key: "tone", label: "Tone", type: "select", options: ["Executive", "Bold", "Practical", "Premium"] }
    ],
    capabilities: ["content.strategy", "task.create"],
    preferredProviders: ["native", "composio", "webhook", "manual"],
    outputRoutes: ["content", "tasks"],
    approvalPolicy: APPROVAL_SENSITIVE_ACTIONS
  },
  {
    id: "opportunity-scorer",
    name: "Opportunity Scorer",
    category: "Revenue",
    description: "Scores an opportunity and routes the next revenue move into the system.",
    systemPrompt: "You are a revenue opportunity evaluator. Score fit, urgency, expected value, and recommend the next practical move.",
    inputFields: [
      { key: "title", label: "Opportunity Title" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "expectedRevenue", label: "Expected Revenue AED" },
      { key: "nextAction", label: "Next Action" }
    ],
    capabilities: ["opportunity.score", "task.create"],
    preferredProviders: ["native", "composio", "manual"],
    outputRoutes: ["tasks", "briefings"],
    approvalPolicy: APPROVAL_SENSITIVE_ACTIONS
  },
  {
    id: "decision-advisor",
    name: "Decision Advisor",
    category: "Strategy",
    description: "Converts options into a recommendation, reasoning, risks, and a controlled next step.",
    systemPrompt: "You are a senior decision advisor. Compare options, surface trade-offs, and recommend one practical path.",
    inputFields: [
      { key: "title", label: "Decision Title" },
      { key: "context", label: "Context", type: "textarea" },
      { key: "options", label: "Options", placeholder: "Separate options with commas" }
    ],
    capabilities: ["decision.advise", "task.create"],
    preferredProviders: ["native", "composio", "manual"],
    outputRoutes: ["decisions", "tasks"],
    approvalPolicy: APPROVAL_SENSITIVE_ACTIONS
  },
  {
    id: "lead-qualifier",
    name: "Lead Qualifier",
    category: "Revenue",
    description: "Qualifies a lead, suggests fit, and prepares the next safe follow-up route.",
    systemPrompt: "You qualify leads with commercial realism. Do not overstate revenue. Recommend the next safe follow-up.",
    inputFields: [
      { key: "name", label: "Lead Name" },
      { key: "email", label: "Email" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "sourceName", label: "Source / Offer" }
    ],
    capabilities: ["lead.qualify", "task.create", "email.draft"],
    preferredProviders: ["native", "composio", "webhook", "manual"],
    outputRoutes: ["leads", "tasks"],
    approvalPolicy: APPROVAL_SENSITIVE_ACTIONS
  },
  {
    id: "asset-builder",
    name: "Asset Builder",
    category: "Assets",
    description: "Turns expertise into a monetizable asset outline, sales promise, and production task.",
    systemPrompt: "You convert expertise into practical digital assets with clear buyer value and production steps.",
    inputFields: [
      { key: "title", label: "Asset Title" },
      { key: "type", label: "Asset Type" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "price", label: "Price AED" }
    ],
    capabilities: ["asset.build", "task.create"],
    preferredProviders: ["native", "composio", "manual"],
    outputRoutes: ["assets", "tasks"],
    approvalPolicy: APPROVAL_SENSITIVE_ACTIONS
  },
  {
    id: "market-pulse-reporter",
    name: "Market Pulse Reporter",
    category: "Strategy",
    description: "Generates a short market pulse and routes the recommended move into briefings or tasks.",
    systemPrompt: "You produce concise market pulse intelligence with practical implications and one next move.",
    inputFields: [
      { key: "focusArea", label: "Focus Area" },
      { key: "timeHorizon", label: "Time Horizon", type: "select", options: ["Today", "This week", "This month"] }
    ],
    capabilities: ["market.pulse", "briefing.create", "task.create"],
    preferredProviders: ["composio", "webhook", "native", "manual"],
    outputRoutes: ["briefings", "tasks"],
    approvalPolicy: APPROVAL_SENSITIVE_ACTIONS
  }
];

export function getAgentDefinition(agentId: string) {
  return BUILT_IN_AGENTS.find(agent => agent.id === agentId) ?? BUILT_IN_AGENTS[0];
}
