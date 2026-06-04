import { FinancialNewsItem, SentimentScore } from "@/lib/financial/types";

const BULLISH_WORDS = ["rally", "surge", "gain", "rise", "soar", "beat", "record", "growth", "profit", "upgrade", "buy", "outperform", "breakout", "bull"];
const BEARISH_WORDS = ["crash", "plunge", "drop", "fall", "slump", "miss", "loss", "recession", "sell", "downgrade", "underperform", "bear", "decline", "worry", "fear", "risk"];
const TICKER_RE = /\$([A-Z]{1,5})\b/g;
const FINANCIAL_KEYWORDS = ["stock", "market", "Fed", "interest rate", "earnings", "inflation", "GDP", "S&P", "Nasdaq", "Dow", "IPO", "dividend", "bond", "yield", "crypto", "bitcoin", "ETF", "volatility", "trading", "investment"];

function detectSentiment(text: string): SentimentScore {
  const lower = text.toLowerCase();
  const bullish = BULLISH_WORDS.filter(w => lower.includes(w)).length;
  const bearish = BEARISH_WORDS.filter(w => lower.includes(w)).length;
  if (bullish > bearish) return "bullish";
  if (bearish > bullish) return "bearish";
  return "neutral";
}

function extractTickers(text: string): string[] {
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = TICKER_RE.exec(text)) !== null) matches.push(m[1]);
  TICKER_RE.lastIndex = 0;
  return [...new Set(matches)];
}

function computeRelevance(title: string, summary: string): number {
  const text = `${title} ${summary}`.toLowerCase();
  const matched = FINANCIAL_KEYWORDS.filter(kw => text.includes(kw.toLowerCase())).length;
  return Math.min(100, 30 + matched * 10);
}

function truncate(text: string, max = 300): string {
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

function normalizeItem(input: {
  id?: string | number;
  title?: string;
  url?: string;
  source?: string;
  publishedAt?: string;
  summary?: string;
}): FinancialNewsItem | null {
  if (!input.title || !input.url) return null;
  const combined = `${input.title} ${input.summary ?? ""}`;
  const tickers = extractTickers(combined);
  const sentiment = detectSentiment(combined);
  const relevanceScore = computeRelevance(input.title, input.summary ?? "");
  const publishedAt = input.publishedAt || new Date().toISOString();
  return {
    id: String(input.id ?? `${input.title}-${publishedAt}`),
    title: input.title,
    url: input.url,
    source: input.source ?? "Unknown",
    publishedAt,
    fetchedAt: new Date().toISOString(),
    summary: truncate(input.summary ?? ""),
    tickers,
    sentiment,
    relevanceScore,
  };
}

export async function fetchNewsApiFinancial(apiKey?: string): Promise<FinancialNewsItem[]> {
  if (!apiKey) return [];
  const query = encodeURIComponent("stock market OR earnings OR Federal Reserve OR inflation OR S&P OR Nasdaq OR interest rate OR trading");
  const url = `https://newsapi.org/v2/everything?q=${query}&language=en&pageSize=25&sortBy=publishedAt&domains=reuters.com,bloomberg.com,marketwatch.com,cnbc.com,wsj.com,ft.com,forbes.com,businessinsider.com`;
  const resp = await fetch(url, {
    headers: { "X-Api-Key": apiKey, "User-Agent": "AgentEmpire/1.0" },
    next: { revalidate: 300 },
  } as RequestInit & { next: { revalidate: number } });
  if (!resp.ok) throw new Error(`NewsAPI failed: ${resp.status}`);
  const data = (await resp.json()) as {
    articles?: Array<{ url?: string; title?: string; publishedAt?: string; description?: string; source?: { name?: string } }>;
  };
  return (data.articles ?? [])
    .map((a, i) => normalizeItem({ id: `newsapi-${i}`, title: a.title, url: a.url, source: a.source?.name, publishedAt: a.publishedAt, summary: a.description }))
    .filter((x): x is FinancialNewsItem => Boolean(x));
}

export async function fetchGdeltFinancial(): Promise<FinancialNewsItem[]> {
  const query = encodeURIComponent('(earnings OR "Federal Reserve" OR inflation OR "stock market" OR "interest rate" OR trading OR "market crash" OR "market rally") AND (stocks OR equities OR bonds OR markets)');
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&maxrecords=25&format=json&sort=datedesc`;
  const resp = await fetch(url, {
    headers: { "User-Agent": "AgentEmpire/1.0" },
    next: { revalidate: 300 },
  } as RequestInit & { next: { revalidate: number } });
  if (!resp.ok) throw new Error(`GDELT failed: ${resp.status}`);
  const data = (await resp.json()) as {
    articles?: Array<{ url?: string; url_mobile?: string; title?: string; seendate?: string; domain?: string; sourcecountry?: string; language?: string }>;
  };
  return (data.articles ?? [])
    .filter(a => a.language === "English" || !a.language)
    .map((a, i) => normalizeItem({ id: `gdelt-fin-${i}`, title: a.title, url: a.url_mobile || a.url, source: a.domain || "GDELT", publishedAt: a.seendate, summary: a.domain ? `Source: ${a.domain}` : "" }))
    .filter((x): x is FinancialNewsItem => Boolean(x));
}

export async function fetchYahooFinanceRSS(): Promise<FinancialNewsItem[]> {
  const url = "https://finance.yahoo.com/news/rssindex";
  const resp = await fetch(url, {
    headers: { "User-Agent": "AgentEmpire/1.0", "Accept": "application/rss+xml,application/xml,text/xml" },
    next: { revalidate: 300 },
  } as RequestInit & { next: { revalidate: number } });
  if (!resp.ok) throw new Error(`Yahoo Finance RSS failed: ${resp.status}`);
  const xml = await resp.text();

  const items: FinancialNewsItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  const titleRe = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/;
  const linkRe = /<link>(.*?)<\/link>/;
  const descRe = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/;
  const pubDateRe = /<pubDate>(.*?)<\/pubDate>/;
  const guidRe = /<guid[^>]*>(.*?)<\/guid>/;

  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = itemRe.exec(xml)) !== null) {
    const chunk = match[1];
    const title = titleRe.exec(chunk)?.[1]?.trim();
    const link = linkRe.exec(chunk)?.[1]?.trim() || guidRe.exec(chunk)?.[1]?.trim();
    const desc = descRe.exec(chunk)?.[1]?.trim();
    const pubDate = pubDateRe.exec(chunk)?.[1]?.trim();
    const item = normalizeItem({ id: `yahoo-rss-${idx++}`, title, url: link, source: "Yahoo Finance", publishedAt: pubDate ? new Date(pubDate).toISOString() : undefined, summary: desc });
    if (item) items.push(item);
  }
  return items;
}

export function mergeAndDeduplicateFinancial(items: FinancialNewsItem[]): FinancialNewsItem[] {
  const map = new Map<string, FinancialNewsItem>();
  for (const item of items) {
    if (!map.has(item.url)) map.set(item.url, item);
  }
  return [...map.values()].sort((a, b) => {
    const byScore = b.relevanceScore - a.relevanceScore;
    if (byScore !== 0) return byScore;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}
