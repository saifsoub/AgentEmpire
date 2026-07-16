import { getDb, addOpportunity, addOffer, addContent, addAsset, analyzeDecision, addLead, addTask } from "@/lib/store";
export { AVAILABLE_ACTIONS } from "@/lib/agent-action-defs";

export async function executeAction(action: string, input: Record<string, unknown>): Promise<unknown> {
  switch (action) {
    case "search_empire": {
      const db = await getDb();
      const query = ((input.query as string) ?? "").toLowerCase();
      const section = (input.section as string) ?? "all";
      const result: Record<string, unknown> = {};
      if (section === "all" || section === "opportunities") result.opportunities = db.opportunities.filter(o => !query || o.title.toLowerCase().includes(query) || o.description.toLowerCase().includes(query));
      if (section === "all" || section === "offers") result.offers = db.offers.filter(o => !query || o.name.toLowerCase().includes(query));
      if (section === "all" || section === "content") result.content = db.contentItems.filter(c => !query || c.topic.toLowerCase().includes(query));
      if (section === "all" || section === "assets") result.assets = db.assets.filter(a => !query || a.title.toLowerCase().includes(query));
      if (section === "all" || section === "decisions") result.decisions = db.decisions;
      if (section === "all" || section === "tasks") result.tasks = db.tasks;
      if (section === "all" || section === "leads") result.leads = db.leads;
      return result;
    }
    case "create_opportunity": {
      return addOpportunity({
        title: (input.title as string) ?? "",
        description: (input.description as string) ?? "",
        type: (input.type as string) ?? "Advisory",
        source: (input.source as string) ?? "agent",
        expectedRevenue: (input.expectedRevenue as number) ?? 0,
        nextAction: (input.nextAction as string) ?? "",
        dueDate: (input.dueDate as string) ?? "",
      });
    }
    case "create_offer": {
      return addOffer({
        name: (input.name as string) ?? "",
        audience: (input.audience as string) ?? "",
        problem: (input.problem as string) ?? "",
        promise: (input.promise as string) ?? "",
        pricingModel: (input.pricingModel as string) ?? "Fixed",
        priceMin: (input.priceMin as number) ?? 0,
        priceMax: (input.priceMax as number) ?? 0,
        ctaUrl: (input.ctaUrl as string) ?? "",
      });
    }
    case "create_content": {
      return addContent({
        pillar: (input.pillar as string) ?? "",
        topic: (input.topic as string) ?? "",
        angle: (input.angle as string) ?? "",
        hook: (input.hook as string) ?? "",
        body: (input.body as string) ?? "",
        platform: (input.platform as string) ?? "LinkedIn",
      });
    }
    case "create_asset": {
      return addAsset({
        title: (input.title as string) ?? "",
        type: (input.type as string) ?? "Template",
        summary: (input.summary as string) ?? "",
        price: (input.price as number) ?? 0,
        format: (input.format as string) ?? "PDF",
      });
    }
    case "analyze_decision": {
      return analyzeDecision({
        title: (input.title as string) ?? "",
        context: (input.context as string) ?? "",
        options: (input.options as string[]) ?? [],
      });
    }
    case "create_lead": {
      return addLead({
        name: (input.name as string) ?? "",
        email: (input.email as string) ?? "",
        message: (input.message as string) ?? "",
        sourceType: (input.sourceType as "offer" | "asset") ?? "offer",
        sourceId: (input.sourceId as string) ?? "",
        sourceName: (input.sourceName as string) ?? "",
      });
    }
    case "create_task": {
      return addTask({
        title: (input.title as string) ?? "",
        category: (input.category as string) ?? "",
        priority: (input.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") ?? "MEDIUM",
        linkedEntityType: (input.linkedEntityType as string) ?? "",
        linkedEntityId: (input.linkedEntityId as string) ?? "",
        dueAt: (input.dueAt as string) ?? "",
      });
    }
    case "respond_text": {
      return { response: (input.text as string) ?? (input.response as string) ?? "" };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
