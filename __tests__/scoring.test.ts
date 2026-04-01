import { describe, it, expect } from "vitest";
import { clamp, computeOpportunityScore, computeEmpireScore } from "@/lib/scoring";

describe("clamp", () => {
  it("returns value within range unchanged", () => {
    expect(clamp(50)).toBe(50);
    expect(clamp(0)).toBe(0);
    expect(clamp(100)).toBe(100);
  });

  it("clamps below minimum to min", () => {
    expect(clamp(-10)).toBe(0);
    expect(clamp(-1)).toBe(0);
  });

  it("clamps above maximum to max", () => {
    expect(clamp(101)).toBe(100);
    expect(clamp(200)).toBe(100);
  });

  it("respects custom min and max", () => {
    expect(clamp(5, 10, 20)).toBe(10);
    expect(clamp(25, 10, 20)).toBe(20);
    expect(clamp(15, 10, 20)).toBe(15);
  });
});

describe("computeOpportunityScore", () => {
  const perfect = { fit: 100, revenuePotential: 100, strategicPrestige: 100, urgency: 100, reusability: 100, speedToLaunch: 100, compoundingPotential: 100 };
  const zero = { fit: 0, revenuePotential: 0, strategicPrestige: 0, urgency: 0, reusability: 0, speedToLaunch: 0, compoundingPotential: 0 };

  it("returns 100 for perfect scores", () => {
    expect(computeOpportunityScore(perfect)).toBe(100);
  });

  it("returns 0 for all-zero scores", () => {
    expect(computeOpportunityScore(zero)).toBe(0);
  });

  it("weights revenue highest at 25%", () => {
    const onlyRevenue = { ...zero, revenuePotential: 100 };
    expect(computeOpportunityScore(onlyRevenue)).toBe(25);
  });

  it("weights fit at 20%", () => {
    const onlyFit = { ...zero, fit: 100 };
    expect(computeOpportunityScore(onlyFit)).toBe(20);
  });

  it("weights reusability at 15%", () => {
    const onlyReusability = { ...zero, reusability: 100 };
    expect(computeOpportunityScore(onlyReusability)).toBe(15);
  });

  it("weights strategic prestige at 10%", () => {
    const onlyPrestige = { ...zero, strategicPrestige: 100 };
    expect(computeOpportunityScore(onlyPrestige)).toBe(10);
  });

  it("weights urgency at 10%", () => {
    const onlyUrgency = { ...zero, urgency: 100 };
    expect(computeOpportunityScore(onlyUrgency)).toBe(10);
  });

  it("weights speedToLaunch at 10%", () => {
    const onlySpeed = { ...zero, speedToLaunch: 100 };
    expect(computeOpportunityScore(onlySpeed)).toBe(10);
  });

  it("weights compoundingPotential at 10%", () => {
    const onlyCompounding = { ...zero, compoundingPotential: 100 };
    expect(computeOpportunityScore(onlyCompounding)).toBe(10);
  });

  it("returns a rounded integer", () => {
    const result = computeOpportunityScore({ fit: 82, revenuePotential: 75, strategicPrestige: 72, urgency: 74, reusability: 78, speedToLaunch: 70, compoundingPotential: 80 });
    expect(Number.isInteger(result)).toBe(true);
  });

  it("clamps result between 0 and 100", () => {
    expect(computeOpportunityScore(perfect)).toBeLessThanOrEqual(100);
    expect(computeOpportunityScore(zero)).toBeGreaterThanOrEqual(0);
  });

  it("matches the expected formula for demo data", () => {
    // opp_01: fit=95,rev=min(65000/500,100)=100,prestige=92,urgency=82,reuse=88,speed=74,compound=91
    const score = computeOpportunityScore({ fit: 95, revenuePotential: 100, strategicPrestige: 92, urgency: 82, reusability: 88, speedToLaunch: 74, compoundingPotential: 91 });
    expect(score).toBeGreaterThan(85);
  });
});

describe("computeEmpireScore", () => {
  const perfect = { revenueScore: 100, brandScore: 100, assetScore: 100, decisionScore: 100, executionScore: 100, lifestyleAlignmentScore: 100 };
  const zero = { revenueScore: 0, brandScore: 0, assetScore: 0, decisionScore: 0, executionScore: 0, lifestyleAlignmentScore: 0 };

  it("returns 100 for all-100 inputs", () => {
    expect(computeEmpireScore(perfect)).toBe(100);
  });

  it("returns 0 for all-zero inputs", () => {
    expect(computeEmpireScore(zero)).toBe(0);
  });

  it("weights revenue at 25%", () => {
    expect(computeEmpireScore({ ...zero, revenueScore: 100 })).toBe(25);
  });

  it("weights brand at 20%", () => {
    expect(computeEmpireScore({ ...zero, brandScore: 100 })).toBe(20);
  });

  it("weights assets at 20%", () => {
    expect(computeEmpireScore({ ...zero, assetScore: 100 })).toBe(20);
  });

  it("weights decisions at 15%", () => {
    expect(computeEmpireScore({ ...zero, decisionScore: 100 })).toBe(15);
  });

  it("weights execution at 10%", () => {
    expect(computeEmpireScore({ ...zero, executionScore: 100 })).toBe(10);
  });

  it("weights lifestyle at 10%", () => {
    expect(computeEmpireScore({ ...zero, lifestyleAlignmentScore: 100 })).toBe(10);
  });

  it("returns a rounded integer", () => {
    const result = computeEmpireScore({ revenueScore: 65, brandScore: 45, assetScore: 40, decisionScore: 72, executionScore: 28, lifestyleAlignmentScore: 81 });
    expect(Number.isInteger(result)).toBe(true);
  });

  it("clamps result between 0 and 100", () => {
    expect(computeEmpireScore(perfect)).toBeLessThanOrEqual(100);
    expect(computeEmpireScore(zero)).toBeGreaterThanOrEqual(0);
  });
});
