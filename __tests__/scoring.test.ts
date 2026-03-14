import { describe, it, expect } from "vitest";
import { clamp, computeOpportunityScore, computeEmpireScore } from "@/lib/scoring";

// ─── clamp ────────────────────────────────────────────────────────────────────

describe("clamp", () => {
  it("returns the value when within range", () => {
    expect(clamp(50)).toBe(50);
  });

  it("clamps to the minimum", () => {
    expect(clamp(-10)).toBe(0);
  });

  it("clamps to the maximum", () => {
    expect(clamp(110)).toBe(100);
  });

  it("returns min when value equals min", () => {
    expect(clamp(0)).toBe(0);
  });

  it("returns max when value equals max", () => {
    expect(clamp(100)).toBe(100);
  });

  it("respects custom min and max", () => {
    expect(clamp(5, 10, 90)).toBe(10);
    expect(clamp(95, 10, 90)).toBe(90);
    expect(clamp(50, 10, 90)).toBe(50);
  });
});

// ─── computeOpportunityScore ──────────────────────────────────────────────────

describe("computeOpportunityScore", () => {
  const perfect = {
    fit: 100,
    revenuePotential: 100,
    strategicPrestige: 100,
    urgency: 100,
    reusability: 100,
    speedToLaunch: 100,
    compoundingPotential: 100,
  };

  const zero = {
    fit: 0,
    revenuePotential: 0,
    strategicPrestige: 0,
    urgency: 0,
    reusability: 0,
    speedToLaunch: 0,
    compoundingPotential: 0,
  };

  it("returns 100 when all inputs are 100", () => {
    expect(computeOpportunityScore(perfect)).toBe(100);
  });

  it("returns 0 when all inputs are 0", () => {
    expect(computeOpportunityScore(zero)).toBe(0);
  });

  it("returns a value between 0 and 100 for real-world inputs", () => {
    const score = computeOpportunityScore({
      fit: 82,
      revenuePotential: 65,
      strategicPrestige: 88,
      urgency: 74,
      reusability: 78,
      speedToLaunch: 70,
      compoundingPotential: 80,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("gives revenuePotential the highest weight (0.25)", () => {
    const baseInput = {
      fit: 50,
      revenuePotential: 50,
      strategicPrestige: 50,
      urgency: 50,
      reusability: 50,
      speedToLaunch: 50,
      compoundingPotential: 50,
    };
    const highRevenue = { ...baseInput, revenuePotential: 100 };
    const highFit = { ...baseInput, fit: 100 };
    // Increasing revenuePotential by 50 should have larger impact than increasing fit by 50
    const revenueDelta =
      computeOpportunityScore(highRevenue) - computeOpportunityScore(baseInput);
    const fitDelta =
      computeOpportunityScore(highFit) - computeOpportunityScore(baseInput);
    expect(revenueDelta).toBeGreaterThan(fitDelta);
  });

  it("returns a rounded integer", () => {
    const score = computeOpportunityScore({
      fit: 75,
      revenuePotential: 63,
      strategicPrestige: 72,
      urgency: 68,
      reusability: 81,
      speedToLaunch: 77,
      compoundingPotential: 79,
    });
    expect(Number.isInteger(score)).toBe(true);
  });
});

// ─── computeEmpireScore ───────────────────────────────────────────────────────

describe("computeEmpireScore", () => {
  const perfect = {
    revenueScore: 100,
    brandScore: 100,
    assetScore: 100,
    decisionScore: 100,
    executionScore: 100,
    lifestyleAlignmentScore: 100,
  };

  const zero = {
    revenueScore: 0,
    brandScore: 0,
    assetScore: 0,
    decisionScore: 0,
    executionScore: 0,
    lifestyleAlignmentScore: 0,
  };

  it("returns 100 when all pillars are 100", () => {
    expect(computeEmpireScore(perfect)).toBe(100);
  });

  it("returns 0 when all pillars are 0", () => {
    expect(computeEmpireScore(zero)).toBe(0);
  });

  it("returns a value between 0 and 100 for mixed inputs", () => {
    const score = computeEmpireScore({
      revenueScore: 64,
      brandScore: 22,
      assetScore: 40,
      decisionScore: 91,
      executionScore: 14,
      lifestyleAlignmentScore: 81,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("gives revenue the highest weight (0.25)", () => {
    const base = {
      revenueScore: 50,
      brandScore: 50,
      assetScore: 50,
      decisionScore: 50,
      executionScore: 50,
      lifestyleAlignmentScore: 50,
    };
    const highRevenue = { ...base, revenueScore: 100 };
    const highExecution = { ...base, executionScore: 100 };
    const revenueDelta =
      computeEmpireScore(highRevenue) - computeEmpireScore(base);
    const executionDelta =
      computeEmpireScore(highExecution) - computeEmpireScore(base);
    expect(revenueDelta).toBeGreaterThan(executionDelta);
  });

  it("returns a rounded integer", () => {
    const score = computeEmpireScore({
      revenueScore: 33,
      brandScore: 67,
      assetScore: 55,
      decisionScore: 78,
      executionScore: 42,
      lifestyleAlignmentScore: 61,
    });
    expect(Number.isInteger(score)).toBe(true);
  });
});
