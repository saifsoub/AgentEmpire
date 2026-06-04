export type SentimentScore = "bullish" | "bearish" | "neutral";
export type SignalStrength = "strong" | "moderate" | "weak";
export type RiskMode = "conservative" | "moderate" | "aggressive";

export interface FinancialNewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  fetchedAt: string;
  summary: string;
  tickers: string[];
  sentiment: SentimentScore;
  relevanceScore: number;
}

export interface SocialPost {
  text: string;
  score: number;
  url?: string;
}

export interface SocialSignal {
  platform: "twitter" | "reddit";
  subreddit?: string;
  keyword: string;
  timestamp: string;
  mentionCount: number;
  sentimentScore: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  topPosts: SocialPost[];
}

export interface MarketIndicator {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  volumeRatio: number;
  atr14: number;
  volatilityLabel: "low" | "normal" | "elevated" | "extreme";
  trend: "up" | "down" | "sideways";
  updatedAt: string;
}

export interface TradingSignal {
  ticker: string;
  signal: "BUY" | "SELL" | "HOLD" | "WATCH";
  confidence: "high" | "medium" | "low";
  rationale: string;
  compositeScore: number;
  newsContribution: number;
  sentimentContribution: number;
  marketContribution: number;
}

export interface TradingStrategy {
  id: string;
  name: string;
  riskMode: RiskMode;
  overallSentiment: SentimentScore;
  sentimentStrength: SignalStrength;
  marketCondition: "trending" | "ranging" | "volatile" | "crisis";
  activeSignals: TradingSignal[];
  positionSizingMultiplier: number;
  recommendation: string;
  keyThemes: string[];
  lastUpdated: string;
}

export interface FinancialInsight {
  title: string;
  detail: string;
  confidence: "high" | "medium" | "low";
}

export interface FinancialMonitorResponse {
  updatedAt: string;
  news: FinancialNewsItem[];
  socialSignals: SocialSignal[];
  marketIndicators: MarketIndicator[];
  strategy: TradingStrategy;
  insights: FinancialInsight[];
  sourceStatus: {
    newsapi: "ok" | "degraded" | "disabled";
    gdelt: "ok" | "degraded";
    yahoo_rss: "ok" | "degraded";
    reddit: "ok" | "degraded";
    twitter: "ok" | "degraded" | "disabled";
    market_data: "ok" | "degraded";
    claude: "ok" | "heuristic" | "degraded";
  };
}

export interface FinancialSnapshot {
  capturedAt: string;
  overallSentiment: SentimentScore;
  sentimentScore: number;
  dominantTicker: string;
  marketCondition: string;
  newsCount: number;
}
