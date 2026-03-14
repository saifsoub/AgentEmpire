import { describe, it, expect } from "vitest";
import {
  createOpportunitySchema,
  createOfferSchema,
  createContentSchema,
  createAssetSchema,
  analyzeDecisionSchema,
} from "@/lib/validators";

// ─── createOpportunitySchema ──────────────────────────────────────────────────

describe("createOpportunitySchema", () => {
  const valid = {
    title: "Government AI Readiness Workshop",
    type: "Advisory",
    expectedRevenue: "25000",
  };

  it("accepts a minimal valid payload", () => {
    const result = createOpportunitySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("coerces expectedRevenue from string to number", () => {
    const result = createOpportunitySchema.safeParse(valid);
    expect(result.success && result.data.expectedRevenue).toBe(25000);
  });

  it("defaults description to empty string when omitted", () => {
    const result = createOpportunitySchema.safeParse(valid);
    expect(result.success && result.data.description).toBe("");
  });

  it("defaults source to 'manual' when omitted", () => {
    const result = createOpportunitySchema.safeParse(valid);
    expect(result.success && result.data.source).toBe("manual");
  });

  it("rejects title shorter than 3 characters", () => {
    const result = createOpportunitySchema.safeParse({ ...valid, title: "AI" });
    expect(result.success).toBe(false);
  });

  it("rejects type shorter than 2 characters", () => {
    const result = createOpportunitySchema.safeParse({ ...valid, type: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects negative expectedRevenue", () => {
    const result = createOpportunitySchema.safeParse({
      ...valid,
      expectedRevenue: "-1",
    });
    expect(result.success).toBe(false);
  });

  it("allows zero expectedRevenue", () => {
    const result = createOpportunitySchema.safeParse({
      ...valid,
      expectedRevenue: "0",
    });
    expect(result.success).toBe(true);
  });
});

// ─── createOfferSchema ────────────────────────────────────────────────────────

describe("createOfferSchema", () => {
  const valid = { name: "Executive AI Diagnostic" };

  it("accepts a minimal payload with name only", () => {
    const result = createOfferSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    const result = createOfferSchema.safeParse({ name: "AI" });
    expect(result.success).toBe(false);
  });

  it("defaults pricingModel to 'Fixed'", () => {
    const result = createOfferSchema.safeParse(valid);
    expect(result.success && result.data.pricingModel).toBe("Fixed");
  });

  it("coerces priceMin from string", () => {
    const result = createOfferSchema.safeParse({ ...valid, priceMin: "15000" });
    expect(result.success && result.data.priceMin).toBe(15000);
  });

  it("rejects negative priceMin", () => {
    const result = createOfferSchema.safeParse({ ...valid, priceMin: "-500" });
    expect(result.success).toBe(false);
  });
});

// ─── createContentSchema ──────────────────────────────────────────────────────

describe("createContentSchema", () => {
  const valid = { topic: "Why AI strategies fail in execution" };

  it("accepts a minimal payload with topic only", () => {
    const result = createContentSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects topic shorter than 3 characters", () => {
    const result = createContentSchema.safeParse({ topic: "AI" });
    expect(result.success).toBe(false);
  });

  it("defaults pillar to 'Authority'", () => {
    const result = createContentSchema.safeParse(valid);
    expect(result.success && result.data.pillar).toBe("Authority");
  });

  it("defaults platform to 'LinkedIn'", () => {
    const result = createContentSchema.safeParse(valid);
    expect(result.success && result.data.platform).toBe("LinkedIn");
  });
});

// ─── createAssetSchema ────────────────────────────────────────────────────────

describe("createAssetSchema", () => {
  const valid = { title: "Government AI Readiness Toolkit" };

  it("accepts a minimal payload with title only", () => {
    const result = createAssetSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    const result = createAssetSchema.safeParse({ title: "AI" });
    expect(result.success).toBe(false);
  });

  it("defaults type to 'Toolkit'", () => {
    const result = createAssetSchema.safeParse(valid);
    expect(result.success && result.data.type).toBe("Toolkit");
  });

  it("defaults format to 'PDF'", () => {
    const result = createAssetSchema.safeParse(valid);
    expect(result.success && result.data.format).toBe("PDF");
  });

  it("defaults price to 0", () => {
    const result = createAssetSchema.safeParse(valid);
    expect(result.success && result.data.price).toBe(0);
  });

  it("coerces price from string", () => {
    const result = createAssetSchema.safeParse({ ...valid, price: "499" });
    expect(result.success && result.data.price).toBe(499);
  });
});

// ─── analyzeDecisionSchema ────────────────────────────────────────────────────

describe("analyzeDecisionSchema", () => {
  const valid = {
    title: "What should be monetized first?",
    context: "Several ideas exist but not all deserve immediate focus.",
    options: ["Executive diagnostic", "Digital toolkit"],
  };

  it("accepts a valid payload with two options", () => {
    const result = analyzeDecisionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts three or more options", () => {
    const result = analyzeDecisionSchema.safeParse({
      ...valid,
      options: ["Option A", "Option B", "Option C"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    const result = analyzeDecisionSchema.safeParse({ ...valid, title: "No" });
    expect(result.success).toBe(false);
  });

  it("rejects context shorter than 10 characters", () => {
    const result = analyzeDecisionSchema.safeParse({
      ...valid,
      context: "Short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 2 options", () => {
    const result = analyzeDecisionSchema.safeParse({
      ...valid,
      options: ["Only one"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty options array", () => {
    const result = analyzeDecisionSchema.safeParse({ ...valid, options: [] });
    expect(result.success).toBe(false);
  });
});
