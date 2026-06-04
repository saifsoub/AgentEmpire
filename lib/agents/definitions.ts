export type ToolProviderName = "composio" | "native" | "mcp" | "webhook" | "manual";

export type AgentCapability =
  | "agent.execute"
  | "task.create"
  | "task.subtask.create"
  | "content.create"
  | "opportunity.manage"
  | "decision.manage"
  | "lead.manage"
  | "asset.manage"
  | "briefing.create"
  | "email.draft"
  | "calendar.create"
  | "github.issue.create";

export interface AgentToolOption {
  id: AgentCapability;
  label: string;
  provider: ToolProviderName | "auto";
  description: string;
  sensitive?: boolean;
}

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
  description: string;
  instructions: string;
  inputFields: AgentInputField[];
  selectedTools: AgentCapability[];
  preferredProviders: ToolProviderName[];
  approvalPolicy: string[];
  enabled: boolean;
  userCreated?: boolean;
}

export const APPROVAL_SENSITIVE_ACTIONS = [
  "external_send",
  "publish",
  "payment",
  "commitment",
  "delete",
  "spend_money"
];

export const TOOL_OPTIONS: AgentToolOption[] = [
  { id: "agent.execute", label: "General Execution", provider: "auto", description: "Let the agent reason, decompose, create work, and use selected tools." },
  { id: "task.create", label: "Create Tasks", provider: "native", description: "Create useful internal tasks when execution needs them." },
  { id: "task.subtask.create", label: "Create Subtasks", provider: "native", description: "Break work into subtasks without asking for step-by-step approval." },
  { id: "content.create", label: "Content Work", provider: "native", description: "Create, structure, or prepare content internally." },
  { id: "opportunity.manage", label: "Opportunity Work", provider: "native", description: "Manage opportunity records, scoring, packaging, and next moves." },
  { id: "decision.manage", label: "Decision Work", provider: "native", description: "Create decision records and recommended paths." },
  { id: "lead.manage", label: "Lead Work", provider: "native", description: "Create and update lead work internally." },
  { id: "asset.manage", label: "Asset Work", provider: "native", description: "Create and prepare asset work internally." },
  { id: "briefing.create", label: "Briefings", provider: "native", description: "Create briefings and operating notes." },
  { id: "email.draft", label: "Email Draft", provider: "composio", description: "Prepare email drafts through connected providers; sending requires approval.", sensitive: true },
  { id: "calendar.create", label: "Calendar", provider: "composio", description: "Prepare calendar actions through connected providers; external invites may require approval.", sensitive: true },
  { id: "github.issue.create", label: "GitHub Issue", provider: "composio", description: "Create or prepare GitHub issues through connected providers." }
];

export const DEFAULT_AGENTS: AgentDefinition[] = [
  {
    id: "general-operator",
    name: "General Operator",
    description: "A versatile internal agent that can execute, decompose work, create tasks/subtasks, and use selected tools.",
    instructions: "You are a versatile operational agent. Do all useful internal work needed to complete the user's objective. Create tasks and subtasks when useful. Do not create technical placeholder tasks. Ask approval only for sensitive external actions or final-stage approval.",
    inputFields: [
      { key: "objective", label: "Objective", type: "textarea", placeholder: "Tell this agent what to do." }
    ],
    selectedTools: ["agent.execute", "task.create", "task.subtask.create", "briefing.create"],
    preferredProviders: ["native", "composio", "mcp", "webhook", "manual"],
    approvalPolicy: APPROVAL_SENSITIVE_ACTIONS,
    enabled: true
  },
  {
    id: "financial-sentiment-monitor",
    name: "Financial Sentiment Monitor",
    description: "Monitors financial news from top sources, analyzes Twitter/Reddit sentiment every 5 minutes, tracks market indicators, and adjusts trading strategies dynamically.",
    instructions: "You are a quantitative financial intelligence agent. Analyze the current financial monitor brief and produce actionable trading strategy recommendations. Identify the dominant market narrative, key tickers under pressure, and signal strength. Create a briefing summarizing findings. Flag any significant market condition changes for operator review. Never recommend specific dollar amounts or guarantee returns — produce signal-based insights only.",
    inputFields: [
      { key: "riskMode", label: "Risk Mode", type: "select", options: ["conservative", "moderate", "aggressive"], placeholder: "moderate" },
      { key: "focus", label: "Focus Symbols (comma-separated)", type: "text", placeholder: "SPY,QQQ,AAPL" }
    ],
    selectedTools: ["agent.execute", "briefing.create", "task.create", "decision.manage"],
    preferredProviders: ["native", "webhook", "mcp", "manual"],
    approvalPolicy: [...APPROVAL_SENSITIVE_ACTIONS, "trade_execution", "order_placement"],
    enabled: true
  }
];

export function getAgentDefinition(agentId: string) {
  return DEFAULT_AGENTS.find(agent => agent.id === agentId) ?? DEFAULT_AGENTS[0];
}
