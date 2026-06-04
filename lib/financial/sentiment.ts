import Anthropic from "@anthropic-ai/sdk";
import { FinancialInsight, FinancialNewsItem, SentimentScore, SignalStrength, SocialSignal } from "@/lib/financial/types";

interface SentimentResult {
  overallSentiment: SentimentScore;
  sentimentStrength: SignalStrength;
  keyThemes: string[];
  insights: FinancialInsight[];
  compositeScore: number;
}

const BULLISH = ["rally", "surge", "gain", "rise", "beat", "record", "growth", "profit", "upgrade", "buy", "breakout", "bull", "soar", "strong"];
const BEARISH = ["crash", "plunge", "drop", "fall", "slump", "miss", "loss", "recession", "sell", "downgrade", "bear", "decline", "fear", "risk", "weak"];

export function buildHeuristicSentiment(news: FinancialNewsItem[], social: SocialSignal[]): SentimentResult {
  let bullishPoints = 0, bearishPoints = 0;

  for (const item of news) {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    bullishPoints += BULLISH.filter(w => text.includes(w)).length;
    bearishPoints += BEARISH.filter(w => text.includes(w)).length;
    if (item.sentiment === "bullish") bullishPoints += 3;
    if (item.sentiment === "bearish") bearishPoints += 3;
  }

  const socialScore = social.length > 0
    ? social.reduce((sum, s) => sum + s.sentimentScore, 0) / social.length
    : 0;

  if (socialScore > 0.2) bullishPoints += Math.round(socialScore * 10);
  if (socialScore < -0.2) bearishPoints += Math.round(Math.abs(socialScore) * 10);

  const total = bullishPoints + bearishPoints || 1;
  const compositeScore = (bullishPoints - bearishPoints) / total;

  const overallSentiment: SentimentScore =
    compositeScore > 0.15 ? "bullish" : compositeScore < -0.15 ? "bearish" : "neutral";

  const absScore = Math.abs(compositeScore);
  const sentimentStrength: SignalStrength = absScore > 0.4 ? "strong" : absScore > 0.2 ? "moderate" : "weak";

  const tickerCounts = new Map<string, number>();
  for (const item of news) {
    for (const ticker of item.tickers) {
      tickerCounts.set(ticker, (tickerCounts.get(ticker) ?? 0) + 1);
    }
  }
  const keyThemes = [...tickerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);

  const insights: FinancialInsight[] = [];

  insights.push({
    title: "Composite Market Sentiment",
    detail: `${overallSentiment.charAt(0).toUpperCase() + overallSentiment.slice(1)} signal with ${sentimentStrength} conviction. News score: ${bullishPoints} bullish vs ${bearishPoints} bearish keywords across ${news.length} articles.`,
    confidence: sentimentStrength === "strong" ? "high" : "medium",
  });

  if (social.length > 0) {
    const avgSocial = social.reduce((s, sig) => s + sig.sentimentScore, 0) / social.length;
    insights.push({
      title: "Social Media Pulse",
      detail: `${social.length} social signals tracked. Average sentiment score: ${(avgSocial * 100).toFixed(0)}/100. Reddit activity suggests ${avgSocial > 0 ? "risk-on" : "risk-off"} positioning.`,
      confidence: social.some(s => s.mentionCount > 10) ? "medium" : "low",
    });
  }

  if (keyThemes.length > 0) {
    insights.push({
      title: "Most Cited Tickers",
      detail: `The following symbols dominate the current feed: ${keyThemes.join(", ")}. Consider elevated attention to these positions.`,
      confidence: "medium",
    });
  }

  return { overallSentiment, sentimentStrength, keyThemes, insights, compositeScore };
}

export async function analyzeWithClaude(news: FinancialNewsItem[], social: SocialSignal[]): Promise<SentimentResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return buildHeuristicSentiment(news, social);

  try {
    const anthropic = new Anthropic({ apiKey });

    const compact = {
      news: news.slice(0, 15).map(n => ({ title: n.title, source: n.source, publishedAt: n.publishedAt, tickers: n.tickers, sentiment: n.sentiment })),
      social: social.slice(0, 6).map(s => ({ platform: s.platform, keyword: s.keyword, mentionCount: s.mentionCount, sentimentScore: s.sentimentScore, topPosts: s.topPosts.slice(0, 3).map(p => p.text) })),
    };

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a quantitative financial analyst. Analyze the following market news and social sentiment data and return a JSON object.

Data:
${JSON.stringify(compact)}

Return ONLY valid JSON with this exact structure:
{
  "overallSentiment": "bullish" | "bearish" | "neutral",
  "sentimentStrength": "strong" | "moderate" | "weak",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "compositeScore": <number between -1 and 1>,
  "insights": [
    { "title": "...", "detail": "...", "confidence": "high" | "medium" | "low" }
  ]
}

Rules:
- keyThemes should be ticker symbols or market themes (max 5)
- compositeScore: +1 = strongly bullish, -1 = strongly bearish
- insights: max 4 items, concise dashboard-grade analysis`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in Claude response");
    const parsed = JSON.parse(jsonMatch[0]) as SentimentResult;
    return parsed;
  } catch {
    return buildHeuristicSentiment(news, social);
  }
}
