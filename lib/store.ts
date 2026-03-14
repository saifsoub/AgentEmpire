import { prisma } from "@/lib/prisma";
import { computeOpportunityScore, computeEmpireScore } from "@/lib/scoring";
import { average } from "@/lib/utils";
import type {
  Opportunity,
  Offer,
  ContentItem,
  Asset,
  Decision,
  Briefing,
  LifestyleItem,
  Task,
  DemoDb,
} from "@/lib/types";

// ─── JSON array helpers (Prisma stores arrays as JSON strings in SQLite) ──────
function parseJson<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return [] as unknown as T;
  }
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

function mapOpportunity(row: {
  id: string;
  title: string;
  description: string;
  type: string;
  source: string;
  status: string;
  expectedRevenue: number;
  confidenceScore: number;
  fitScore: number;
  urgencyScore: number;
  prestigeScore: number;
  effortScore: number;
  reusabilityScore: number;
  speedToLaunchScore: number;
  compoundingScore: number;
  totalScore: number;
  nextAction: string;
  dueDate: string;
  createdAt: Date;
  updatedAt: Date;
}): Opportunity {
  return {
    ...row,
    status: row.status as Opportunity["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapOffer(row: {
  id: string;
  name: string;
  audience: string;
  problem: string;
  promise: string;
  pricingModel: string;
  priceMin: number;
  priceMax: number;
  status: string;
  ctaUrl: string;
  deliverables: string;
  createdAt: Date;
  updatedAt: Date;
}): Offer {
  return {
    ...row,
    status: row.status as Offer["status"],
    deliverables: parseJson<string[]>(row.deliverables),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapContent(row: {
  id: string;
  pillar: string;
  topic: string;
  angle: string;
  hook: string;
  body: string;
  platform: string;
  status: string;
  scheduledFor: string;
  publishedAt: string;
  views: number;
  engagements: number;
  clicks: number;
  leads: number;
  createdAt: Date;
  updatedAt: Date;
}): ContentItem {
  return {
    ...row,
    status: row.status as ContentItem["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapAsset(row: {
  id: string;
  title: string;
  type: string;
  summary: string;
  status: string;
  price: number;
  format: string;
  salesCopy: string;
  createdAt: Date;
  updatedAt: Date;
}): Asset {
  return {
    ...row,
    status: row.status as Asset["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapDecision(row: {
  id: string;
  title: string;
  context: string;
  options: string;
  recommendedOption: string;
  reasoningSummary: string;
  riskLevel: string;
  impactScore: number;
  reversibilityScore: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): Decision {
  return {
    ...row,
    options: parseJson<string[]>(row.options),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapBriefing(row: {
  id: string;
  weekStart: string;
  weekObjective: string;
  topMoves: string;
  risks: string;
  focusAreas: string;
  reviewNotes: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): Briefing {
  return {
    ...row,
    topMoves: parseJson<string[]>(row.topMoves),
    risks: parseJson<string[]>(row.risks),
    focusAreas: parseJson<string[]>(row.focusAreas),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapLifestyle(row: {
  id: string;
  title: string;
  category: string;
  roi: number;
  status: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}): LifestyleItem {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapTask(row: {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  linkedEntityType: string;
  linkedEntityId: string;
  dueAt: string;
  createdAt: Date;
  updatedAt: Date;
}): Task {
  return {
    ...row,
    priority: row.priority as Task["priority"],
    status: row.status as Task["status"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getDb(): Promise<DemoDb> {
  const [
    opportunities,
    offers,
    contentItems,
    assets,
    decisions,
    briefings,
    lifestyle,
    tasks,
  ] = await Promise.all([
    prisma.opportunity.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.offer.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.contentItem.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.asset.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.decision.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.briefing.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.lifestyleItem.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.task.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return {
    opportunities: opportunities.map(mapOpportunity),
    offers: offers.map(mapOffer),
    contentItems: contentItems.map(mapContent),
    assets: assets.map(mapAsset),
    decisions: decisions.map(mapDecision),
    briefings: briefings.map(mapBriefing),
    lifestyle: lifestyle.map(mapLifestyle),
    tasks: tasks.map(mapTask),
  };
}

export async function getDashboardSummary() {
  const db = await getDb();
  const revenueScore = Math.min(
    db.opportunities.filter((o) => o.totalScore >= 75).length * 18 +
      db.offers.filter((o) => o.status === "LIVE").length * 10,
    100,
  );
  const brandScore = Math.min(
    db.contentItems.filter((c) => c.status === "PUBLISHED").length * 12 +
      average(db.contentItems.map((c) => Math.min(c.engagements / 3, 20))),
    100,
  );
  const assetScore = Math.min(
    db.assets.filter((a) =>
      ["PRODUCTIZED", "PUBLISHED", "MONETIZED"].includes(a.status),
    ).length * 20,
    100,
  );
  const decisionScore = Math.min(
    average(db.decisions.map((d) => d.impactScore)) || 72,
    100,
  );
  const executionScore = Math.min(
    db.tasks.filter((t) => t.status === "DONE").length * 14,
    100,
  );
  const lifestyleAlignmentScore = Math.min(
    average(db.lifestyle.map((l) => l.roi)) || 78,
    100,
  );
  const empireScore = computeEmpireScore({
    revenueScore,
    brandScore,
    assetScore,
    decisionScore,
    executionScore,
    lifestyleAlignmentScore,
  });

  return {
    empireScore,
    revenueScore,
    brandScore,
    assetScore,
    decisionScore,
    executionScore,
    lifestyleAlignmentScore,
    topOpportunities: [...db.opportunities]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5),
    liveOffers: db.offers.filter((o) => o.status === "LIVE").length,
    monetizedAssets: db.assets.filter((a) => a.status === "MONETIZED").length,
    weeklyFocus: db.briefings[0]?.topMoves ?? [],
  };
}

export async function addOpportunity(input: {
  title: string;
  description: string;
  type: string;
  source: string;
  expectedRevenue: number;
  nextAction: string;
  dueDate: string;
}): Promise<Opportunity> {
  const revenuePotential = Math.min(
    Math.round(input.expectedRevenue / 500),
    100,
  );
  const fit = 82;
  const strategicPrestige = input.type.toLowerCase().includes("advis")
    ? 88
    : 72;
  const urgency = input.dueDate ? 74 : 52;
  const reusability = 78;
  const speedToLaunch = 70;
  const compoundingPotential = 80;
  const totalScore = computeOpportunityScore({
    fit,
    revenuePotential,
    strategicPrestige,
    urgency,
    reusability,
    speedToLaunch,
    compoundingPotential,
  });

  const row = await prisma.opportunity.create({
    data: {
      title: input.title,
      description: input.description,
      type: input.type,
      source: input.source,
      status: "IDEA",
      expectedRevenue: input.expectedRevenue,
      confidenceScore: 70,
      fitScore: fit,
      urgencyScore: urgency,
      prestigeScore: strategicPrestige,
      effortScore: 45,
      reusabilityScore: reusability,
      speedToLaunchScore: speedToLaunch,
      compoundingScore: compoundingPotential,
      totalScore,
      nextAction: input.nextAction || "Validate and package",
      dueDate: input.dueDate,
    },
  });
  return mapOpportunity(row);
}

export async function addOffer(input: {
  name: string;
  audience: string;
  problem: string;
  promise: string;
  pricingModel: string;
  priceMin: number;
  priceMax: number;
  ctaUrl: string;
}): Promise<Offer> {
  const row = await prisma.offer.create({
    data: {
      name: input.name,
      audience: input.audience,
      problem: input.problem,
      promise: input.promise,
      pricingModel: input.pricingModel,
      priceMin: input.priceMin,
      priceMax: input.priceMax,
      status: "DRAFT",
      ctaUrl: input.ctaUrl,
      deliverables: JSON.stringify(["Discovery", "Framework", "Executive memo"]),
    },
  });
  return mapOffer(row);
}

export async function addContent(input: {
  pillar: string;
  topic: string;
  angle: string;
  hook: string;
  body: string;
  platform: string;
}): Promise<ContentItem> {
  const row = await prisma.contentItem.create({
    data: {
      pillar: input.pillar,
      topic: input.topic,
      angle: input.angle,
      hook: input.hook,
      body: input.body,
      platform: input.platform,
      status: "DRAFT",
    },
  });
  return mapContent(row);
}

export async function addAsset(input: {
  title: string;
  type: string;
  summary: string;
  price: number;
  format: string;
}): Promise<Asset> {
  const row = await prisma.asset.create({
    data: {
      title: input.title,
      type: input.type,
      summary: input.summary,
      status: "DRAFT",
      price: input.price,
      format: input.format,
      salesCopy:
        "Premium asset built to convert expertise into monetizable IP.",
    },
  });
  return mapAsset(row);
}

export async function analyzeDecision(input: {
  title: string;
  context: string;
  options: string[];
}): Promise<Decision> {
  // TODO: Replace this placeholder logic with a real LLM-powered decision analysis
  // (e.g. call an OpenAI/Anthropic API with the title, context, and options to get a
  // data-driven recommendation, risk assessment, and reasoning summary).
  // analyzeDecisionSchema enforces options.length >= 2, so index 0 always exists.
  const winner = input.options[0];
  const row = await prisma.decision.create({
    data: {
      title: input.title,
      context: input.context,
      options: JSON.stringify(input.options),
      recommendedOption: winner,
      reasoningSummary: `Prioritize "${winner}" because it offers the strongest blend of speed, strategic fit, and compounding value.`,
      riskLevel: "Medium",
      impactScore: 88,
      reversibilityScore: 74,
      status: "READY",
    },
  });
  return mapDecision(row);
}

export async function generateWeeklyBrief(): Promise<Briefing> {
  const opportunities = await prisma.opportunity.findMany({
    orderBy: { totalScore: "desc" },
    take: 3,
  });

  const top = opportunities.map((o) => o.title);
  const row = await prisma.briefing.create({
    data: {
      weekStart: new Date().toISOString().slice(0, 10),
      weekObjective:
        "Turn one high-value idea into a monetizable asset and publish two authority signals.",
      topMoves: JSON.stringify([
        `Package ${top[0] ?? "your top opportunity"} into a clear offer`,
        "Publish 2 authority posts linked to a real offer",
        "Convert one existing framework into a premium downloadable asset",
      ]),
      risks: JSON.stringify([
        "Over-splitting focus",
        "Packaging too late",
        "Posting without clear CTA",
      ]),
      focusAreas: JSON.stringify(["Revenue", "Brand", "Assets"]),
      reviewNotes:
        "Keep this week brutally focused on leverage and conversion.",
      status: "READY",
    },
  });

  // Keep only latest 8 briefings
  const old = await prisma.briefing.findMany({
    orderBy: { createdAt: "desc" },
    skip: 8,
    select: { id: true },
  });
  if (old.length > 0) {
    await prisma.briefing.deleteMany({
      where: { id: { in: old.map((b) => b.id) } },
    });
  }

  return mapBriefing(row);
}
