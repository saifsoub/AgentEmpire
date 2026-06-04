import { fetchGdeltFinancial, fetchNewsApiFinancial, fetchYahooFinanceRSS, mergeAndDeduplicateFinancial } from "@/lib/financial/news-sources";
import { fetchRedditSentiment, fetchTwitterSentiment } from "@/lib/financial/social";
import { fetchMarketIndicators } from "@/lib/financial/market";
import { analyzeWithClaude, buildHeuristicSentiment } from "@/lib/financial/sentiment";
import { generateTradingStrategy } from "@/lib/financial/strategy";
import { FinancialMonitorResponse, RiskMode } from "@/lib/financial/types";

const SOCIAL_KEYWORDS = ["SPY", "QQQ", "earnings", "Fed", "inflation", "market", "stocks"];

export async function buildFinancialBrief(riskMode: RiskMode = "moderate"): Promise<FinancialMonitorResponse> {
  const newsApiKey = process.env.NEWS_API_KEY;
  const twitterBearer = process.env.TWITTER_BEARER_TOKEN;
  const watchSymbols = (process.env.WATCH_SYMBOLS ?? "SPY,QQQ,VIX").split(",").map(s => s.trim());

  const [newsApiResult, gdeltResult, yahooRssResult, redditResult, twitterResult, marketResult] =
    await Promise.allSettled([
      fetchNewsApiFinancial(newsApiKey),
      fetchGdeltFinancial(),
      fetchYahooFinanceRSS(),
      fetchRedditSentiment(SOCIAL_KEYWORDS),
      fetchTwitterSentiment(twitterBearer, SOCIAL_KEYWORDS),
      fetchMarketIndicators(watchSymbols),
    ]);

  const newsApiItems = newsApiResult.status === "fulfilled" ? newsApiResult.value : [];
  const gdeltItems = gdeltResult.status === "fulfilled" ? gdeltResult.value : [];
  const yahooItems = yahooRssResult.status === "fulfilled" ? yahooRssResult.value : [];
  const redditSignals = redditResult.status === "fulfilled" ? redditResult.value : [];
  const twitterSignals = twitterResult.status === "fulfilled" ? twitterResult.value : [];
  const marketIndicators = marketResult.status === "fulfilled" ? marketResult.value : [];

  const allNews = mergeAndDeduplicateFinancial([...newsApiItems, ...gdeltItems, ...yahooItems]).slice(0, 30);
  const socialSignals = [...redditSignals, ...twitterSignals];

  const useClaude = Boolean(process.env.ANTHROPIC_API_KEY);
  let sentimentResult;
  let claudeStatus: FinancialMonitorResponse["sourceStatus"]["claude"] = "heuristic";

  if (useClaude) {
    try {
      sentimentResult = await analyzeWithClaude(allNews, socialSignals);
      claudeStatus = "ok";
    } catch {
      sentimentResult = buildHeuristicSentiment(allNews, socialSignals);
      claudeStatus = "degraded";
    }
  } else {
    sentimentResult = buildHeuristicSentiment(allNews, socialSignals);
  }

  const strategy = generateTradingStrategy(allNews, socialSignals, marketIndicators, sentimentResult, riskMode);

  return {
    updatedAt: new Date().toISOString(),
    news: allNews,
    socialSignals,
    marketIndicators,
    strategy,
    insights: sentimentResult.insights,
    sourceStatus: {
      newsapi: newsApiKey ? (newsApiResult.status === "fulfilled" ? "ok" : "degraded") : "disabled",
      gdelt: gdeltResult.status === "fulfilled" ? "ok" : "degraded",
      yahoo_rss: yahooRssResult.status === "fulfilled" ? "ok" : "degraded",
      reddit: redditResult.status === "fulfilled" ? "ok" : "degraded",
      twitter: twitterBearer ? (twitterResult.status === "fulfilled" ? "ok" : "degraded") : "disabled",
      market_data: marketResult.status === "fulfilled" ? "ok" : "degraded",
      claude: claudeStatus,
    },
  };
}
