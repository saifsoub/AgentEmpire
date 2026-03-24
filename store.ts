import fs from "node:fs/promises";
import path from "node:path";
import { DemoDb } from "@/lib/types";
import { computeOpportunityScore, computeEmpireScore } from "@/lib/scoring";
import { average } from "@/lib/utils";
const dbPath = path.join(process.cwd(), "data", "demo-db.json");
async function readDb(): Promise<DemoDb> { return JSON.parse(await fs.readFile(dbPath, "utf-8")) as DemoDb; }
async function writeDb(data: DemoDb) { await fs.writeFile(dbPath, JSON.stringify(data, null, 2)); }
const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
export async function getDb() { return readDb(); }
export async function getDashboardSummary() {
  const db = await readDb();
  const revenueScore = Math.min(db.opportunities.filter(o => o.totalScore >= 75).length * 18 + db.offers.filter(o => o.status === "LIVE").length * 10, 100);
  const brandScore = Math.min(db.contentItems.filter(c => c.status === "PUBLISHED").length * 12 + average(db.contentItems.map(c => Math.min(c.engagements / 3, 20))), 100);
  const assetScore = Math.min(db.assets.filter(a => ["PRODUCTIZED", "PUBLISHED", "MONETIZED"].includes(a.status)).length * 20, 100);
  const decisionScore = Math.min(average(db.decisions.map(d => d.impactScore)) || 72, 100);
  const executionScore = Math.min(db.tasks.filter(t => t.status === "DONE").length * 14, 100);
  const lifestyleAlignmentScore = Math.min(average(db.lifestyle.map(l => l.roi)) || 78, 100);
  const empireScore = computeEmpireScore({ revenueScore, brandScore, assetScore, decisionScore, executionScore, lifestyleAlignmentScore });
  return { empireScore, revenueScore, brandScore, assetScore, decisionScore, executionScore, lifestyleAlignmentScore, topOpportunities: [...db.opportunities].sort((a,b)=>b.totalScore-a.totalScore).slice(0,5), liveOffers: db.offers.filter(o=>o.status==="LIVE").length, monetizedAssets: db.assets.filter(a=>a.status==="MONETIZED").length, weeklyFocus: db.briefings[0]?.topMoves ?? [] };
}
export async function addOpportunity(input: { title: string; description: string; type: string; source: string; expectedRevenue: number; nextAction: string; dueDate: string; }) {
  const db = await readDb();
  const revenuePotential = Math.min(Math.round(input.expectedRevenue / 500), 100);
  const fit = 82, strategicPrestige = input.type.toLowerCase().includes("advis") ? 88 : 72, urgency = input.dueDate ? 74 : 52, reusability = 78, speedToLaunch = 70, compoundingPotential = 80;
  const totalScore = computeOpportunityScore({ fit, revenuePotential, strategicPrestige, urgency, reusability, speedToLaunch, compoundingPotential });
  const item = { id: id("opp"), title: input.title, description: input.description, type: input.type, source: input.source, status: "IDEA" as const, expectedRevenue: input.expectedRevenue, confidenceScore: 70, fitScore: fit, urgencyScore: urgency, prestigeScore: strategicPrestige, effortScore: 45, reusabilityScore: reusability, speedToLaunchScore: speedToLaunch, compoundingScore: compoundingPotential, totalScore, nextAction: input.nextAction || "Validate and package", dueDate: input.dueDate, createdAt: now(), updatedAt: now() };
  db.opportunities.unshift(item); await writeDb(db); return item;
}
export async function addOffer(input: { name: string; audience: string; problem: string; promise: string; pricingModel: string; priceMin: number; priceMax: number; ctaUrl: string; calUrl?: string; }) {
  const db = await readDb();
  const item = { id: id("offer"), name: input.name, audience: input.audience, problem: input.problem, promise: input.promise, pricingModel: input.pricingModel, priceMin: input.priceMin, priceMax: input.priceMax, status: "DRAFT" as const, ctaUrl: input.ctaUrl, calUrl: input.calUrl ?? "", deliverables: ["Discovery","Framework","Executive memo"], createdAt: now(), updatedAt: now() };
  db.offers.unshift(item); await writeDb(db); return item;
}
export async function addContent(input: { pillar: string; topic: string; angle: string; hook: string; body: string; platform: string; }) {
  const db = await readDb();
  const item = { id: id("content"), pillar: input.pillar, topic: input.topic, angle: input.angle, hook: input.hook, body: input.body, platform: input.platform, status: "DRAFT" as const, scheduledFor: "", publishedAt: "", views: 0, engagements: 0, clicks: 0, leads: 0, createdAt: now(), updatedAt: now() };
  db.contentItems.unshift(item); await writeDb(db); return item;
}
export async function addAsset(input: { title: string; type: string; summary: string; price: number; format: string; buyUrl?: string; }) {
  const db = await readDb();
  const item = { id: id("asset"), title: input.title, type: input.type, summary: input.summary, status: "DRAFT" as const, price: input.price, format: input.format, salesCopy: "Premium asset built to convert expertise into monetizable IP.", buyUrl: input.buyUrl ?? "", createdAt: now(), updatedAt: now() };
  db.assets.unshift(item); await writeDb(db); return item;
}
export async function addLead(input: { name: string; email: string; message: string; sourceType: "offer" | "asset"; sourceId: string; sourceName: string; refContentId: string; }) {
  const db = await readDb();
  if (!db.leads) db.leads = [];
  const item = { id: id("lead"), name: input.name, email: input.email, message: input.message, sourceType: input.sourceType, sourceId: input.sourceId, sourceName: input.sourceName, refContentId: input.refContentId, status: "NEW" as const, createdAt: now() };
  db.leads.unshift(item); await writeDb(db); return item;
}
export async function analyzeDecision(input: { title: string; context: string; options: string[]; }) {
  const db = await readDb();
  const winner = input.options[0];
  const item = { id: id("decision"), title: input.title, context: input.context, options: input.options, recommendedOption: winner, reasoningSummary: `Prioritize "${winner}" because it offers the strongest blend of speed, strategic fit, and compounding value.`, riskLevel: "Medium", impactScore: 88, reversibilityScore: 74, status: "READY", createdAt: now(), updatedAt: now() };
  db.decisions.unshift(item); await writeDb(db); return item;
}
export async function generateWeeklyBrief() {
  const db = await readDb();
  const top = [...db.opportunities].sort((a,b)=>b.totalScore-a.totalScore).slice(0,3);
  const item = { id: id("brief"), weekStart: new Date().toISOString().slice(0,10), weekObjective: "Turn one high-value idea into a monetizable asset and publish two authority signals.", topMoves: [`Package ${top[0]?.title ?? "your top opportunity"} into a clear offer`, "Publish 2 authority posts linked to a real offer", "Convert one existing framework into a premium downloadable asset"], risks: ["Over-splitting focus", "Packaging too late", "Posting without clear CTA"], focusAreas: ["Revenue", "Brand", "Assets"], reviewNotes: "Keep this week brutally focused on leverage and conversion.", status: "READY", createdAt: now(), updatedAt: now() };
  db.briefings.unshift(item); db.briefings = db.briefings.slice(0,8); await writeDb(db); return item;
}
