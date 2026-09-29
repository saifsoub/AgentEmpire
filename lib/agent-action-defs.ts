export const AVAILABLE_ACTIONS: { value: string; label: string; description: string }[] = [
  { value: "search_empire", label: "Search Empire Data", description: "Read and search across all empire data (opportunities, offers, content, assets, etc.)" },
  { value: "create_opportunity", label: "Create Opportunity", description: "Add a new opportunity to the pipeline" },
  { value: "create_offer", label: "Create Offer", description: "Create a new offer/service listing" },
  { value: "create_content", label: "Create Content", description: "Create a new content piece" },
  { value: "create_asset", label: "Create Asset", description: "Create a new monetizable asset" },
  { value: "analyze_decision", label: "Analyze Decision", description: "Structure and analyze a decision" },
  { value: "create_lead", label: "Create Lead", description: "Add a new lead to the system" },
  { value: "create_task", label: "Create Task", description: "Create a new task" },
  { value: "respond_text", label: "Text Response", description: "Return a text-only analysis (no side effects)" },
];
