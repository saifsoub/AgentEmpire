export interface Opportunity {
  id: string; title: string; description: string; type: string; source: string;
  status: "IDEA" | "VALIDATING" | "PACKAGING" | "SELLING" | "LIVE" | "ARCHIVED";
  expectedRevenue: number; confidenceScore: number; fitScore: number; urgencyScore: number;
  prestigeScore: number; effortScore: number; reusabilityScore: number; speedToLaunchScore: number;
  compoundingScore: number; totalScore: number; nextAction: string; dueDate: string; createdAt: string; updatedAt: string;
}
export interface Offer {
  id: string; name: string; audience: string; problem: string; promise: string;
  pricingModel: string; priceMin: number; priceMax: number;
  status: "DRAFT" | "READY" | "LIVE" | "ARCHIVED";
  ctaUrl: string; deliverables: string[]; createdAt: string; updatedAt: string;
}
export interface ContentItem {
  id: string; pillar: string; topic: string; angle: string; hook: string; body: string;
  platform: string; status: "IDEA" | "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  scheduledFor: string; publishedAt: string; views: number; engagements: number;
  clicks: number; leads: number; createdAt: string; updatedAt: string;
}
export interface Asset {
  id: string; title: string; type: string; summary: string;
  status: "IDEA" | "DRAFT" | "PRODUCTIZED" | "PUBLISHED" | "MONETIZED" | "ARCHIVED";
  price: number; format: string; salesCopy: string; createdAt: string; updatedAt: string;
}
export interface Decision {
  id: string; title: string; context: string; options: string[];
  recommendedOption: string; reasoningSummary: string; riskLevel: string;
  impactScore: number; reversibilityScore: number; status: string;
  createdAt: string; updatedAt: string;
}
export interface Briefing {
  id: string; weekStart: string; weekObjective: string; topMoves: string[];
  risks: string[]; focusAreas: string[]; reviewNotes: string; status: string;
  createdAt: string; updatedAt: string;
}
export interface LifestyleItem {
  id: string; title: string; category: string; roi: number; status: string;
  note: string; createdAt: string; updatedAt: string;
}
export interface Task {
  id: string; title: string; category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED";
  linkedEntityType: string; linkedEntityId: string; dueAt: string;
  createdAt: string; updatedAt: string;
}
export interface DemoDb {
  opportunities: Opportunity[]; offers: Offer[]; contentItems: ContentItem[];
  assets: Asset[]; decisions: Decision[]; briefings: Briefing[];
  lifestyle: LifestyleItem[]; tasks: Task[];
}
