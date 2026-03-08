export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}
export function computeOpportunityScore(input: {
  fit: number; revenuePotential: number; strategicPrestige: number;
  urgency: number; reusability: number; speedToLaunch: number; compoundingPotential: number;
}) {
  const score =
    input.fit * 0.2 + input.revenuePotential * 0.25 + input.strategicPrestige * 0.1 +
    input.urgency * 0.1 + input.reusability * 0.15 + input.speedToLaunch * 0.1 +
    input.compoundingPotential * 0.1;
  return Math.round(clamp(score));
}
export function computeEmpireScore(input: {
  revenueScore: number; brandScore: number; assetScore: number;
  decisionScore: number; executionScore: number; lifestyleAlignmentScore: number;
}) {
  const score =
    input.revenueScore * 0.25 + input.brandScore * 0.2 + input.assetScore * 0.2 +
    input.decisionScore * 0.15 + input.executionScore * 0.1 + input.lifestyleAlignmentScore * 0.1;
  return Math.round(clamp(score));
}
