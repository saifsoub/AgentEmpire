import { MarketIndicator } from "@/lib/financial/types";

const SYMBOL_NAMES: Record<string, string> = {
  SPY: "S&P 500 ETF",
  QQQ: "Nasdaq 100 ETF",
  DIA: "Dow Jones ETF",
  VIX: "Volatility Index",
  GLD: "Gold ETF",
  TLT: "20Y Treasury ETF",
  AAPL: "Apple",
  MSFT: "Microsoft",
  TSLA: "Tesla",
  NVDA: "NVIDIA",
  AMZN: "Amazon",
};

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        previousClose?: number;
        regularMarketVolume?: number;
        averageDailyVolume3Month?: number;
        fiftyTwoWeekHigh?: number;
        fiftyTwoWeekLow?: number;
        symbol?: string;
      };
      indicators?: {
        quote?: Array<{
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
      timestamp?: number[];
    }>;
    error?: { code?: string; description?: string };
  };
}

function computeATR14(highs: number[], lows: number[], closes: number[]): number {
  if (highs.length < 2) return 0;
  const trueRanges: number[] = [];
  for (let i = 1; i < Math.min(highs.length, 15); i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }
  return trueRanges.reduce((a, b) => a + b, 0) / Math.max(trueRanges.length, 1);
}

function labelVolatility(atr: number, price: number): MarketIndicator["volatilityLabel"] {
  if (price <= 0) return "normal";
  const pct = (atr / price) * 100;
  if (pct > 3) return "extreme";
  if (pct > 1.5) return "elevated";
  if (pct < 0.5) return "low";
  return "normal";
}

function detectTrend(closes: number[]): MarketIndicator["trend"] {
  if (closes.length < 5) return "sideways";
  const recent = closes.slice(-5).filter(c => c != null) as number[];
  if (recent.length < 2) return "sideways";
  const first = recent[0];
  const last = recent[recent.length - 1];
  const changePct = ((last - first) / first) * 100;
  if (changePct > 1) return "up";
  if (changePct < -1) return "down";
  return "sideways";
}

async function fetchSymbol(symbol: string): Promise<MarketIndicator | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo&includePrePost=false`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "AgentEmpire/1.0", "Accept": "application/json" },
      next: { revalidate: 300 },
    } as RequestInit & { next: { revalidate: number } });

    if (!resp.ok) return null;

    const data = (await resp.json()) as YahooChartResponse;
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta ?? {};
    const quote = result.indicators?.quote?.[0] ?? {};
    const price = meta.regularMarketPrice ?? 0;
    const prevClose = meta.previousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
    const volume = meta.regularMarketVolume ?? 0;
    const avgVolume = meta.averageDailyVolume3Month ?? volume || 1;
    const volumeRatio = avgVolume > 0 ? volume / avgVolume : 1;

    const highs = (quote.high ?? []).filter((v): v is number => v != null);
    const lows = (quote.low ?? []).filter((v): v is number => v != null);
    const closes = (quote.close ?? []).filter((v): v is number => v != null);

    const atr14 = computeATR14(highs, lows, closes);

    return {
      symbol,
      name: SYMBOL_NAMES[symbol] ?? symbol,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume,
      avgVolume,
      volumeRatio: Math.round(volumeRatio * 100) / 100,
      atr14: Math.round(atr14 * 100) / 100,
      volatilityLabel: labelVolatility(atr14, price),
      trend: detectTrend(closes),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function fetchMarketIndicators(symbols?: string[]): Promise<MarketIndicator[]> {
  const watchSymbols = symbols ?? (process.env.WATCH_SYMBOLS ?? "SPY,QQQ,VIX").split(",").map(s => s.trim()).filter(Boolean);
  const results = await Promise.all(watchSymbols.slice(0, 6).map(fetchSymbol));
  return results.filter((r): r is MarketIndicator => r !== null);
}
