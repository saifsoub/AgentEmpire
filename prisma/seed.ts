/**
 * Prisma seed – populates the database with demo data from data/demo-db.json
 *
 * Run with: npm run db:seed
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";

function buildPrisma() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const filePath = url.replace(/^file:/, "");
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const adapter = new PrismaBetterSqlite3({ url: resolved });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

interface DemoOpportunity {
  id: string; title: string; description: string; type: string; source: string; status: string;
  expectedRevenue: number; confidenceScore: number; fitScore: number; urgencyScore: number;
  prestigeScore: number; effortScore: number; reusabilityScore: number; speedToLaunchScore: number;
  compoundingScore: number; totalScore: number; nextAction: string; dueDate: string;
  createdAt: string; updatedAt: string;
}
interface DemoOffer {
  id: string; name: string; audience: string; problem: string; promise: string; pricingModel: string;
  priceMin: number; priceMax: number; status: string; ctaUrl: string; deliverables: string[];
  createdAt: string; updatedAt: string;
}
interface DemoContentItem {
  id: string; pillar: string; topic: string; angle: string; hook: string; body: string;
  platform: string; status: string; scheduledFor: string; publishedAt: string;
  views: number; engagements: number; clicks: number; leads: number;
  createdAt: string; updatedAt: string;
}
interface DemoAsset {
  id: string; title: string; type: string; summary: string; status: string; price: number;
  format: string; salesCopy: string; createdAt: string; updatedAt: string;
}
interface DemoDecision {
  id: string; title: string; context: string; options: string[]; recommendedOption: string;
  reasoningSummary: string; riskLevel: string; impactScore: number; reversibilityScore: number;
  status: string; createdAt: string; updatedAt: string;
}
interface DemoBriefing {
  id: string; weekStart: string; weekObjective: string; topMoves: string[]; risks: string[];
  focusAreas: string[]; reviewNotes: string; status: string; createdAt: string; updatedAt: string;
}
interface DemoLifestyleItem {
  id: string; title: string; category: string; roi: number; status: string; note: string;
  createdAt: string; updatedAt: string;
}
interface DemoTask {
  id: string; title: string; category: string; priority: string; status: string;
  linkedEntityType: string; linkedEntityId: string; dueAt: string; createdAt: string; updatedAt: string;
}
interface DemoDb {
  opportunities: DemoOpportunity[]; offers: DemoOffer[]; contentItems: DemoContentItem[];
  assets: DemoAsset[]; decisions: DemoDecision[]; briefings: DemoBriefing[];
  lifestyle: DemoLifestyleItem[]; tasks: DemoTask[];
}

async function main() {
  const prisma = buildPrisma();
  const raw = fs.readFileSync(path.join(process.cwd(), "data", "demo-db.json"), "utf-8");
  const demo = JSON.parse(raw) as DemoDb;

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.lifestyleItem.deleteMany();
  await prisma.briefing.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.opportunity.deleteMany();

  for (const o of demo.opportunities) {
    await prisma.opportunity.create({
      data: {
        title: o.title, description: o.description, type: o.type, source: o.source,
        status: o.status, expectedRevenue: o.expectedRevenue, confidenceScore: o.confidenceScore,
        fitScore: o.fitScore, urgencyScore: o.urgencyScore, prestigeScore: o.prestigeScore,
        effortScore: o.effortScore, reusabilityScore: o.reusabilityScore,
        speedToLaunchScore: o.speedToLaunchScore, compoundingScore: o.compoundingScore,
        totalScore: o.totalScore, nextAction: o.nextAction, dueDate: o.dueDate,
        createdAt: new Date(o.createdAt), updatedAt: new Date(o.updatedAt),
      },
    });
  }

  for (const o of demo.offers) {
    await prisma.offer.create({
      data: {
        name: o.name, audience: o.audience, problem: o.problem, promise: o.promise,
        pricingModel: o.pricingModel, priceMin: o.priceMin, priceMax: o.priceMax,
        status: o.status, ctaUrl: o.ctaUrl, deliverables: JSON.stringify(o.deliverables),
        createdAt: new Date(o.createdAt), updatedAt: new Date(o.updatedAt),
      },
    });
  }

  for (const c of demo.contentItems) {
    await prisma.contentItem.create({
      data: {
        pillar: c.pillar, topic: c.topic, angle: c.angle, hook: c.hook, body: c.body,
        platform: c.platform, status: c.status, scheduledFor: c.scheduledFor,
        publishedAt: c.publishedAt, views: c.views, engagements: c.engagements,
        clicks: c.clicks, leads: c.leads,
        createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt),
      },
    });
  }

  for (const a of demo.assets) {
    await prisma.asset.create({
      data: {
        title: a.title, type: a.type, summary: a.summary, status: a.status,
        price: a.price, format: a.format, salesCopy: a.salesCopy,
        createdAt: new Date(a.createdAt), updatedAt: new Date(a.updatedAt),
      },
    });
  }

  for (const d of demo.decisions) {
    await prisma.decision.create({
      data: {
        title: d.title, context: d.context, options: JSON.stringify(d.options),
        recommendedOption: d.recommendedOption, reasoningSummary: d.reasoningSummary,
        riskLevel: d.riskLevel, impactScore: d.impactScore, reversibilityScore: d.reversibilityScore,
        status: d.status,
        createdAt: new Date(d.createdAt), updatedAt: new Date(d.updatedAt),
      },
    });
  }

  for (const b of demo.briefings) {
    await prisma.briefing.create({
      data: {
        weekStart: b.weekStart, weekObjective: b.weekObjective,
        topMoves: JSON.stringify(b.topMoves), risks: JSON.stringify(b.risks),
        focusAreas: JSON.stringify(b.focusAreas), reviewNotes: b.reviewNotes,
        status: b.status,
        createdAt: new Date(b.createdAt), updatedAt: new Date(b.updatedAt),
      },
    });
  }

  for (const l of demo.lifestyle) {
    await prisma.lifestyleItem.create({
      data: {
        title: l.title, category: l.category, roi: l.roi, status: l.status, note: l.note,
        createdAt: new Date(l.createdAt), updatedAt: new Date(l.updatedAt),
      },
    });
  }

  for (const t of demo.tasks) {
    await prisma.task.create({
      data: {
        title: t.title, category: t.category, priority: t.priority, status: t.status,
        linkedEntityType: t.linkedEntityType, linkedEntityId: t.linkedEntityId, dueAt: t.dueAt,
        createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt),
      },
    });
  }

  console.log("✅ Database seeded from data/demo-db.json");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
