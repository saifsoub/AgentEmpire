import { SocialSignal } from "@/lib/financial/types";

const BULLISH_WORDS = ["buy", "long", "bull", "moon", "calls", "green", "up", "rocket", "yolo", "gains", "pump", "rally", "breakout", "support", "hodl", "accumulate"];
const BEARISH_WORDS = ["sell", "short", "bear", "puts", "red", "down", "crash", "dump", "correction", "overvalued", "hedge", "recession", "collapse", "drop", "fall"];

const FINANCIAL_SUBREDDITS = ["wallstreetbets", "stocks", "investing", "stockmarket", "SecurityAnalysis", "ValueInvesting"];
const DEFAULT_KEYWORDS = ["SPY", "QQQ", "market", "earnings", "Fed", "inflation", "stocks"];

function scoreSentiment(texts: string[]): { bullish: number; bearish: number; neutral: number; score: number } {
  let bullish = 0, bearish = 0, neutral = 0;
  for (const text of texts) {
    const lower = text.toLowerCase();
    const b = BULLISH_WORDS.filter(w => lower.includes(w)).length;
    const br = BEARISH_WORDS.filter(w => lower.includes(w)).length;
    if (b > br) bullish++;
    else if (br > b) bearish++;
    else neutral++;
  }
  const total = Math.max(bullish + bearish + neutral, 1);
  const score = (bullish - bearish) / total;
  return { bullish, bearish, neutral, score };
}

export async function fetchRedditSentiment(keywords: string[] = DEFAULT_KEYWORDS): Promise<SocialSignal[]> {
  const signals: SocialSignal[] = [];
  const subreddits = FINANCIAL_SUBREDDITS.slice(0, 3).join("+");

  for (const keyword of keywords.slice(0, 4)) {
    try {
      const url = `https://www.reddit.com/r/${subreddits}/search.json?q=${encodeURIComponent(keyword)}&sort=hot&limit=20&t=day&restrict_sr=false`;
      const resp = await fetch(url, {
        headers: { "User-Agent": "AgentEmpire:financial-monitor:1.0" },
        next: { revalidate: 300 },
      } as RequestInit & { next: { revalidate: number } });

      if (!resp.ok) continue;

      const data = (await resp.json()) as {
        data?: {
          children?: Array<{
            data?: { title?: string; selftext?: string; score?: number; permalink?: string; subreddit?: string };
          }>;
        };
      };

      const posts = (data.data?.children ?? []).map(c => c.data).filter(Boolean);
      const texts = posts.map(p => `${p?.title ?? ""} ${p?.selftext ?? ""}`).filter(Boolean);
      const { bullish, bearish, neutral, score } = scoreSentiment(texts);

      const topPosts = posts.slice(0, 5).map(p => ({
        text: (p?.title ?? "").slice(0, 120),
        score: Number(p?.score ?? 0),
        url: p?.permalink ? `https://reddit.com${p.permalink}` : undefined,
      }));

      signals.push({
        platform: "reddit",
        subreddit: subreddits,
        keyword,
        timestamp: new Date().toISOString(),
        mentionCount: posts.length,
        sentimentScore: score,
        bullishCount: bullish,
        bearishCount: bearish,
        neutralCount: neutral,
        topPosts,
      });
    } catch {
      // skip failed keyword
    }
  }

  return signals;
}

export async function fetchTwitterSentiment(bearerToken: string | undefined, keywords: string[] = DEFAULT_KEYWORDS): Promise<SocialSignal[]> {
  if (!bearerToken) return [];
  const signals: SocialSignal[] = [];

  for (const keyword of keywords.slice(0, 3)) {
    try {
      const query = encodeURIComponent(`${keyword} (stocks OR market OR trading OR investing) lang:en -is:retweet`);
      const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=50&tweet.fields=public_metrics,created_at`;
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${bearerToken}`, "User-Agent": "AgentEmpire/1.0" },
        next: { revalidate: 300 },
      } as RequestInit & { next: { revalidate: number } });

      if (!resp.ok) continue;

      const data = (await resp.json()) as {
        data?: Array<{ text?: string; public_metrics?: { like_count?: number; retweet_count?: number }; id?: string }>;
        meta?: { result_count?: number };
      };

      const tweets = data.data ?? [];
      const texts = tweets.map(t => t.text ?? "").filter(Boolean);
      const { bullish, bearish, neutral, score } = scoreSentiment(texts);

      const topPosts = tweets.slice(0, 5).map(t => ({
        text: (t.text ?? "").slice(0, 120),
        score: (t.public_metrics?.like_count ?? 0) + (t.public_metrics?.retweet_count ?? 0),
        url: t.id ? `https://twitter.com/i/web/status/${t.id}` : undefined,
      }));

      signals.push({
        platform: "twitter",
        keyword,
        timestamp: new Date().toISOString(),
        mentionCount: tweets.length,
        sentimentScore: score,
        bullishCount: bullish,
        bearishCount: bearish,
        neutralCount: neutral,
        topPosts,
      });
    } catch {
      // skip failed keyword
    }
  }

  return signals;
}
