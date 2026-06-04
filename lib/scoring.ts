import type { AgentScores } from "@/lib/types";

export function clamp(value: number, min = 0, max = 100) { return Math.max(min, Math.min(max, value)); }
export function computeOpportunityScore(input: { fit: number; revenuePotential: number; strategicPrestige: number; urgency: number; reusability: number; speedToLaunch: number; compoundingPotential: number; }) {
  const score = input.fit*0.2 + input.revenuePotential*0.25 + input.strategicPrestige*0.1 + input.urgency*0.1 + input.reusability*0.15 + input.speedToLaunch*0.1 + input.compoundingPotential*0.1;
  return Math.round(clamp(score));
}
export function computeEmpireScore(input: { revenueScore: number; brandScore: number; assetScore: number; decisionScore: number; executionScore: number; lifestyleAlignmentScore: number; }) {
  const score = input.revenueScore*0.25 + input.brandScore*0.2 + input.assetScore*0.2 + input.decisionScore*0.15 + input.executionScore*0.1 + input.lifestyleAlignmentScore*0.1;
  return Math.round(clamp(score));
}

export function computeAgentPerformanceScore(scores: AgentScores): number {
  const raw = scores.usefulness*0.25 + scores.clarity*0.15 + scores.accuracy*0.20 + scores.personality_fit*0.10 + scores.execution_speed*0.10 + scores.business_value*0.15 + scores.delight_factor*0.05;
  return Math.round(clamp(raw));
}

export function getScoreTier(score: number): "bronze" | "silver" | "gold" | "platinum" | "star" {
  if (score >= 98) return "star";
  if (score >= 93) return "platinum";
  if (score >= 85) return "gold";
  if (score >= 75) return "silver";
  return "bronze";
}
