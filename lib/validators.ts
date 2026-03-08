import { z } from "zod";

export const createOpportunitySchema = z.object({
  title: z.string().min(3),
  description: z.string().default(""),
  type: z.string().min(2),
  source: z.string().default("manual"),
  expectedRevenue: z.coerce.number().min(0).default(0),
  nextAction: z.string().default(""),
  dueDate: z.string().default(""),
});
export const createOfferSchema = z.object({
  name: z.string().min(3),
  audience: z.string().default(""),
  problem: z.string().default(""),
  promise: z.string().default(""),
  pricingModel: z.string().default("Fixed"),
  priceMin: z.coerce.number().min(0).default(0),
  priceMax: z.coerce.number().min(0).default(0),
  ctaUrl: z.string().default(""),
});
export const createContentSchema = z.object({
  pillar: z.string().default("Authority"),
  topic: z.string().min(3),
  angle: z.string().default(""),
  hook: z.string().default(""),
  body: z.string().default(""),
  platform: z.string().default("LinkedIn"),
});
export const createAssetSchema = z.object({
  title: z.string().min(3),
  type: z.string().default("Toolkit"),
  summary: z.string().default(""),
  price: z.coerce.number().min(0).default(0),
  format: z.string().default("PDF"),
});
export const analyzeDecisionSchema = z.object({
  title: z.string().min(3),
  context: z.string().min(10),
  options: z.array(z.string()).min(2),
});
export const createLifestyleSchema = z.object({
  title: z.string().min(3),
  category: z.string().default("Health"),
  roi: z.coerce.number().min(0).max(100).default(50),
  note: z.string().default(""),
});
