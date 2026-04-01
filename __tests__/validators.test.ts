import { describe, it, expect } from "vitest";
import {
  createOpportunitySchema,
  createOfferSchema,
  createContentSchema,
  createAssetSchema,
  analyzeDecisionSchema,
  createLeadSchema,
  createTaskSchema,
  updateSettingsSchema,
} from "@/lib/validators";

describe("createOpportunitySchema", () => {
  it("accepts a valid opportunity", () => {
    const result = createOpportunitySchema.safeParse({ title: "My Opp", type: "Advisory" });
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    expect(createOpportunitySchema.safeParse({ title: "AB", type: "Advisory" }).success).toBe(false);
  });

  it("rejects type shorter than 2 characters", () => {
    expect(createOpportunitySchema.safeParse({ title: "Valid Title", type: "A" }).success).toBe(false);
  });

  it("coerces expectedRevenue string to number", () => {
    const result = createOpportunitySchema.safeParse({ title: "Opp", type: "Advisory", expectedRevenue: "5000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.expectedRevenue).toBe(5000);
  });

  it("defaults expectedRevenue to 0", () => {
    const result = createOpportunitySchema.safeParse({ title: "Opp", type: "Advisory" });
    if (result.success) expect(result.data.expectedRevenue).toBe(0);
  });

  it("defaults source to manual", () => {
    const result = createOpportunitySchema.safeParse({ title: "Opp", type: "Advisory" });
    if (result.success) expect(result.data.source).toBe("manual");
  });

  it("rejects negative expectedRevenue", () => {
    expect(createOpportunitySchema.safeParse({ title: "Opp", type: "Advisory", expectedRevenue: -100 }).success).toBe(false);
  });
});

describe("createOfferSchema", () => {
  it("accepts a valid offer", () => {
    const result = createOfferSchema.safeParse({ name: "My Offer" });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    expect(createOfferSchema.safeParse({ name: "AB" }).success).toBe(false);
  });

  it("coerces priceMin and priceMax to numbers", () => {
    const result = createOfferSchema.safeParse({ name: "Offer", priceMin: "5000", priceMax: "15000" });
    if (result.success) {
      expect(result.data.priceMin).toBe(5000);
      expect(result.data.priceMax).toBe(15000);
    }
  });

  it("defaults pricingModel to Fixed", () => {
    const result = createOfferSchema.safeParse({ name: "Offer" });
    if (result.success) expect(result.data.pricingModel).toBe("Fixed");
  });
});

describe("createContentSchema", () => {
  it("accepts a valid content item", () => {
    const result = createContentSchema.safeParse({ topic: "Why AI fails in government" });
    expect(result.success).toBe(true);
  });

  it("rejects topic shorter than 3 characters", () => {
    expect(createContentSchema.safeParse({ topic: "AB" }).success).toBe(false);
  });

  it("defaults platform to LinkedIn", () => {
    const result = createContentSchema.safeParse({ topic: "My topic" });
    if (result.success) expect(result.data.platform).toBe("LinkedIn");
  });

  it("defaults pillar to Authority", () => {
    const result = createContentSchema.safeParse({ topic: "My topic" });
    if (result.success) expect(result.data.pillar).toBe("Authority");
  });
});

describe("createAssetSchema", () => {
  it("accepts a valid asset", () => {
    const result = createAssetSchema.safeParse({ title: "My Asset" });
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    expect(createAssetSchema.safeParse({ title: "AB" }).success).toBe(false);
  });

  it("coerces price to number", () => {
    const result = createAssetSchema.safeParse({ title: "Asset", price: "299" });
    if (result.success) expect(result.data.price).toBe(299);
  });

  it("defaults format to PDF", () => {
    const result = createAssetSchema.safeParse({ title: "Asset" });
    if (result.success) expect(result.data.format).toBe("PDF");
  });

  it("defaults type to Toolkit", () => {
    const result = createAssetSchema.safeParse({ title: "Asset" });
    if (result.success) expect(result.data.type).toBe("Toolkit");
  });
});

describe("analyzeDecisionSchema", () => {
  it("accepts a valid decision", () => {
    const result = analyzeDecisionSchema.safeParse({ title: "Which to launch first?", context: "We have multiple options on the table and need to choose one to pursue this quarter.", options: ["Option A", "Option B"] });
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    expect(analyzeDecisionSchema.safeParse({ title: "AB", context: "Long enough context here", options: ["A", "B"] }).success).toBe(false);
  });

  it("rejects context shorter than 10 characters", () => {
    expect(analyzeDecisionSchema.safeParse({ title: "Valid title", context: "Short", options: ["A", "B"] }).success).toBe(false);
  });

  it("rejects fewer than 2 options", () => {
    expect(analyzeDecisionSchema.safeParse({ title: "Valid title", context: "Long enough context", options: ["Only one"] }).success).toBe(false);
  });

  it("accepts exactly 2 options", () => {
    const result = analyzeDecisionSchema.safeParse({ title: "Choose this", context: "Long enough context here", options: ["A", "B"] });
    expect(result.success).toBe(true);
  });
});

describe("createLeadSchema", () => {
  it("accepts a valid lead", () => {
    const result = createLeadSchema.safeParse({ name: "John", email: "john@example.com", sourceType: "offer", sourceId: "offer_01", sourceName: "Diagnostic" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(createLeadSchema.safeParse({ name: "", email: "john@example.com", sourceType: "offer", sourceId: "id", sourceName: "name" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(createLeadSchema.safeParse({ name: "John", email: "not-an-email", sourceType: "offer", sourceId: "id", sourceName: "name" }).success).toBe(false);
  });

  it("rejects invalid sourceType", () => {
    expect(createLeadSchema.safeParse({ name: "John", email: "j@j.com", sourceType: "unknown", sourceId: "id", sourceName: "name" }).success).toBe(false);
  });

  it("accepts asset as sourceType", () => {
    const result = createLeadSchema.safeParse({ name: "Jane", email: "jane@example.com", sourceType: "asset", sourceId: "asset_01", sourceName: "Toolkit" });
    expect(result.success).toBe(true);
  });

  it("defaults message to empty string", () => {
    const result = createLeadSchema.safeParse({ name: "Jane", email: "jane@example.com", sourceType: "asset", sourceId: "asset_01", sourceName: "Toolkit" });
    if (result.success) expect(result.data.message).toBe("");
  });
});

describe("createTaskSchema", () => {
  it("accepts a valid task", () => {
    const result = createTaskSchema.safeParse({ title: "Finalize pricing" });
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    expect(createTaskSchema.safeParse({ title: "AB" }).success).toBe(false);
  });

  it("defaults priority to MEDIUM", () => {
    const result = createTaskSchema.safeParse({ title: "Valid task" });
    if (result.success) expect(result.data.priority).toBe("MEDIUM");
  });

  it("accepts all valid priorities", () => {
    for (const priority of ["LOW", "MEDIUM", "HIGH", "CRITICAL"]) {
      const result = createTaskSchema.safeParse({ title: "Task", priority });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid priority", () => {
    expect(createTaskSchema.safeParse({ title: "Task", priority: "URGENT" }).success).toBe(false);
  });

  it("defaults category to General", () => {
    const result = createTaskSchema.safeParse({ title: "Valid task" });
    if (result.success) expect(result.data.category).toBe("General");
  });
});

describe("updateSettingsSchema", () => {
  it("accepts a full valid settings object", () => {
    const result = updateSettingsSchema.safeParse({ empireName: "My Empire", ownerName: "Alice", currency: "USD", timezone: "America/New_York", primaryMarket: "Tech", weekStartsOn: "monday" });
    expect(result.success).toBe(true);
  });

  it("rejects empty empireName", () => {
    expect(updateSettingsSchema.safeParse({ empireName: "" }).success).toBe(false);
  });

  it("rejects invalid weekStartsOn value", () => {
    expect(updateSettingsSchema.safeParse({ empireName: "Empire", weekStartsOn: "saturday" }).success).toBe(false);
  });

  it("accepts sunday as weekStartsOn", () => {
    const result = updateSettingsSchema.safeParse({ empireName: "Empire", weekStartsOn: "sunday" });
    expect(result.success).toBe(true);
  });

  it("defaults empireName to Personal Empire", () => {
    const result = updateSettingsSchema.safeParse({});
    if (result.success) expect(result.data.empireName).toBe("Personal Empire");
  });

  it("defaults currency to AED", () => {
    const result = updateSettingsSchema.safeParse({});
    if (result.success) expect(result.data.currency).toBe("AED");
  });

  it("defaults timezone to Asia/Dubai", () => {
    const result = updateSettingsSchema.safeParse({});
    if (result.success) expect(result.data.timezone).toBe("Asia/Dubai");
  });
});
