import { FinancialNewsItem, MarketIndicator, RiskMode, SocialSignal, TradingSignal, TradingStrategy } from "@/lib/financial/types";

interface SentimentInput {
  overallSentiment: string;
  sentimentStrength: string;
  compositeScore: number;
  keyThemes: string[];
}

const RISK_MULTIPLIERS: Record<RiskMode, { base: number; strongBoost: number }> = {
  conservative: { base: 0.5, strongBoost: 0.75 },
  moderate: { base: 0.75, strongBoost: 1.0 },
  aggressive: { base: 1.0, strongBoost: 1.5 },
};

function classifyMarketCondition(indicators: MarketIndicator[]): TradingStrategy["marketCondition"] {
  const extreme = indicators.some(i => i.volatilityLabel === "extreme");
  const elevated = indicators.some(i => i.volatilityLabel === "elevated");
  const allSideway = indicators.every(i => i.trend === "sideways");
  const strongTrend = indicators.filter(i => i.trend !== "sideways").length >= Math.ceil(indicators.length * 0.6);

  if (extreme) return "crisis";
  if (elevated) return "volatile";
  if (strongTrend) return "trending";
  if (allSideway) return "ranging";
  return "ranging";
}

function generateSignals(
  news: FinancialNewsItem[],
  sentiment: SentimentInput,
  indicators: MarketIndicator[],
  social: SocialSignal[],
): TradingSignal[] {
  const signals: TradingSignal[] = [];
  const tickerCounts = new Map<string, { bullish: number; bearish: number; count: number }>();

  for (const item of news) {
    for (const ticker of item.tickers) {
      const entry = tickerCounts.get(ticker) ?? { bullish: 0, bearish: 0, count: 0 };
      entry.count++;
      if (item.sentiment === "bullish") entry.bullish++;
      if (item.sentiment === "bearish") entry.bearish++;
      tickerCounts.set(ticker, entry);
    }
  }

  const avgSocialScore = social.length > 0
    ? social.reduce((s, sig) => s + sig.sentimentScore, 0) / social.length
    : 0;

  for (const [ticker, counts] of [...tickerCounts.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 6)) {
    const newsBias = counts.count > 0 ? (counts.bullish - counts.bearish) / counts.count : 0;
    const newsContribution = Math.round((newsBias + 1) / 2 * 100);
    const sentimentContribution = Math.round((sentiment.compositeScore + 1) / 2 * 100);
    const socialContribution = Math.round((avgSocialScore + 1) / 2 * 100);
    const marketContribution = 50;

    const compositeScore = newsBias * 0.35 + sentiment.compositeScore * 0.30 + avgSocialScore * 0.35;

    let signalType: TradingSignal["signal"];
    let confidence: TradingSignal["confidence"];
    let rationale: string;

    if (compositeScore > 0.4) {
      signalType = "BUY";
      confidence = compositeScore > 0.6 ? "high" : "medium";
      rationale = `Strong bullish confluence: ${counts.bullish} bullish news items, ${sentiment.sentimentStrength} market momentum.`;
    } else if (compositeScore < -0.4) {
      signalType = "SELL";
      confidence = compositeScore < -0.6 ? "high" : "medium";
      rationale = `Bearish pressure: ${counts.bearish} bearish news items, negative social sentiment ${(avgSocialScore * 100).toFixed(0)}%.`;
    } else if (Math.abs(compositeScore) < 0.15) {
      signalType = "HOLD";
      confidence = "medium";
      rationale = `Mixed signals with no clear directional edge. Monitor for breakout.`;
    } else {
      signalType = "WATCH";
      confidence = "low";
      rationale = `Developing signal — insufficient conviction. Watch for confirmation.`;
    }

    signals.push({ ticker, signal: signalType, confidence, rationale, compositeScore: Math.round(compositeScore * 100) / 100, newsContribution, sentimentContribution, marketContribution });
  }

  for (const indicator of indicators) {
    if (!tickerCounts.has(indicator.symbol)) {
      const marketScore = indicator.trend === "up" ? 0.4 : indicator.trend === "down" ? -0.4 : 0;
      const volAdjusted = indicator.volatilityLabel === "extreme" ? marketScore * 0.3 : marketScore;
      const compositeScore = (volAdjusted + sentiment.compositeScore) / 2;

      signals.push({
        ticker: indicator.symbol,
        signal: indicator.volatilityLabel === "extreme" ? "WATCH" : compositeScore > 0.2 ? "BUY" : compositeScore < -0.2 ? "SELL" : "HOLD",
        confidence: indicator.volatilityLabel === "extreme" ? "low" : "medium",
        rationale: `${indicator.trend.toUpperCase()} trend, ${indicator.volatilityLabel} volatility (ATR ${indicator.atr14}). Volume ratio: ${indicator.volumeRatio}×.`,
        compositeScore: Math.round(compositeScore * 100) / 100,
        newsContribution: 0,
        sentimentContribution: Math.round((sentiment.compositeScore + 1) / 2 * 100),
        marketContribution: 100,
      });
    }
  }

  return signals.slice(0, 8);
}

function computePositionSizing(riskMode: RiskMode, marketCondition: TradingStrategy["marketCondition"], sentimentStrength: string): number {
  const { base, strongBoost } = RISK_MULTIPLIERS[riskMode];
  let multiplier = sentimentStrength === "strong" ? strongBoost : base;
  if (marketCondition === "crisis") multiplier *= 0.25;
  else if (marketCondition === "volatile") multiplier *= 0.5;
  return Math.round(multiplier * 100) / 100;
}

function buildRecommendation(sentiment: SentimentInput, marketCondition: TradingStrategy["marketCondition"], riskMode: RiskMode, signals: TradingSignal[]): string {
  const buyCount = signals.filter(s => s.signal === "BUY").length;
  const sellCount = signals.filter(s => s.signal === "SELL").length;

  if (marketCondition === "crisis") {
    return `CRISIS MODE: Extreme volatility detected. Reduce all positions, prioritize capital preservation. Do not add new longs until conditions stabilize.`;
  }
  if (marketCondition === "volatile") {
    return `CAUTION: Elevated volatility. Reduce position sizing by 50%, tighten stops. ${buyCount} potential buy candidates on pullbacks.`;
  }
  if (sentiment.overallSentiment === "bullish" && sentiment.sentimentStrength !== "weak") {
    return `RISK-ON: ${sentiment.sentimentStrength} bullish consensus across ${sentiment.keyThemes.slice(0, 3).join(", ")}. ${buyCount} buy signals active. Scale into positions per ${riskMode} risk tolerance.`;
  }
  if (sentiment.overallSentiment === "bearish" && sentiment.sentimentStrength !== "weak") {
    return `RISK-OFF: ${sentiment.sentimentStrength} bearish signal. ${sellCount} sell/reduce signals. Hedge or reduce exposure. Cash is a position.`;
  }
  return `NEUTRAL: Mixed signals, no decisive edge. Maintain existing positions, avoid initiating new high-conviction bets until clearer directional signal emerges.`;
}

export function generateTradingStrategy(
  news: FinancialNewsItem[],
  social: SocialSignal[],
  indicators: MarketIndicator[],
  sentiment: SentimentInput,
  riskMode: RiskMode = "moderate",
): TradingStrategy {
  const marketCondition = classifyMarketCondition(indicators);
  const signals = generateSignals(news, sentiment, indicators, social);
  const positionSizingMultiplier = computePositionSizing(riskMode, marketCondition, sentiment.sentimentStrength);
  const recommendation = buildRecommendation(sentiment, marketCondition, riskMode, signals);

  return {
    id: `strategy-${Date.now()}`,
    name: `${riskMode.charAt(0).toUpperCase() + riskMode.slice(1)} Financial Monitor Strategy`,
    riskMode,
    overallSentiment: (sentiment.overallSentiment as TradingStrategy["overallSentiment"]),
    sentimentStrength: (sentiment.sentimentStrength as TradingStrategy["sentimentStrength"]),
    marketCondition,
    activeSignals: signals,
    positionSizingMultiplier,
    recommendation,
    keyThemes: sentiment.keyThemes,
    lastUpdated: new Date().toISOString(),
  };
}
