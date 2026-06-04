"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, BarChart2, Clock, Minus, RefreshCw, TrendingDown, TrendingUp, Wifi, WifiOff } from "lucide-react";
import type { FinancialMonitorResponse, RiskMode } from "@/lib/financial/types";

const REFRESH_INTERVAL_MS = 300_000;

function sentimentColor(s: string) {
  if (s === "bullish") return "text-green-400";
  if (s === "bearish") return "text-red-400";
  return "text-yellow-400";
}

function sentimentBg(s: string) {
  if (s === "bullish") return "bg-green-500/10 border-green-500/30";
  if (s === "bearish") return "bg-red-500/10 border-red-500/30";
  return "bg-yellow-500/10 border-yellow-500/30";
}

function signalBadge(signal: string) {
  if (signal === "BUY") return "bg-green-500/20 text-green-300 border border-green-500/40";
  if (signal === "SELL") return "bg-red-500/20 text-red-300 border border-red-500/40";
  if (signal === "HOLD") return "bg-blue-500/20 text-blue-300 border border-blue-500/40";
  return "bg-gray-500/20 text-gray-400 border border-gray-500/40";
}

function volatilityBadge(label: string) {
  if (label === "extreme") return "bg-red-500/20 text-red-300";
  if (label === "elevated") return "bg-orange-500/20 text-orange-300";
  if (label === "low") return "bg-blue-500/20 text-blue-300";
  return "bg-gray-500/20 text-gray-400";
}

function sourceStatusDot(status: string) {
  if (status === "ok") return "bg-green-500";
  if (status === "degraded") return "bg-yellow-500";
  return "bg-gray-600";
}

function formatCountdown(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function FinancialMonitorPage() {
  const [data, setData] = useState<FinancialMonitorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskMode, setRiskMode] = useState<RiskMode>("moderate");
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS);
  const [lastFetch, setLastFetch] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (mode: RiskMode = riskMode, force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/financial-monitor?risk=${mode}`, { cache: "no-store" });
      if (!resp.ok) throw new Error(`API error ${resp.status}`);
      const payload = (await resp.json()) as FinancialMonitorResponse;
      setData(payload);
      setLastFetch(Date.now());
      setCountdown(REFRESH_INTERVAL_MS);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [riskMode]);

  useEffect(() => {
    void fetchData(riskMode);

    intervalRef.current = setInterval(() => { void fetchData(riskMode); }, REFRESH_INTERVAL_MS);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [riskMode, fetchData]);

  const handleRiskChange = (mode: RiskMode) => {
    setRiskMode(mode);
  };

  const handleManualRefresh = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    void fetchData(riskMode, true);
    intervalRef.current = setInterval(() => { void fetchData(riskMode); }, REFRESH_INTERVAL_MS);
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto" />
          <p className="text-sm text-secondary">Loading financial intelligence…</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => void fetchData(riskMode)} className="mt-4 rounded-lg border border-border px-4 py-2 text-sm text-secondary hover:text-primary">Retry</button>
        </div>
      </div>
    );
  }

  const strategy = data?.strategy;
  const marketIndicators = data?.marketIndicators ?? [];
  const news = data?.news ?? [];
  const socialSignals = data?.socialSignals ?? [];
  const insights = data?.insights ?? [];
  const sourceStatus = data?.sourceStatus;

  return (
    <div className="min-h-screen bg-[#0a0f1a] p-6 text-primary">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Live Financial Monitor
          </div>
          <h1 className="text-2xl font-semibold">Financial Sentiment &amp; Trading Monitor</h1>
          <p className="mt-1 text-sm text-secondary">
            Real-time news + social sentiment → dynamic strategy. Refreshes every 5 minutes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Risk mode selector */}
          <div className="flex rounded-xl border border-border bg-surface overflow-hidden text-xs">
            {(["conservative", "moderate", "aggressive"] as RiskMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => handleRiskChange(mode)}
                className={`px-3 py-2 capitalize transition ${riskMode === mode ? "bg-accent/20 text-accent font-semibold" : "text-secondary hover:text-primary"}`}
              >
                {mode}
              </button>
            ))}
          </div>
          {/* Countdown + refresh */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-secondary">
            <Clock className="h-3.5 w-3.5" />
            <span>Next refresh: {formatCountdown(countdown)}</span>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-secondary hover:text-primary disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh now
          </button>
        </div>
      </div>

      {/* Strategy Banner */}
      {strategy && (
        <div className={`mb-6 rounded-2xl border p-5 ${sentimentBg(strategy.overallSentiment)}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {strategy.overallSentiment === "bullish" ? <TrendingUp className="h-5 w-5 text-green-400" /> : strategy.overallSentiment === "bearish" ? <TrendingDown className="h-5 w-5 text-red-400" /> : <Minus className="h-5 w-5 text-yellow-400" />}
                <span className={`text-lg font-bold capitalize ${sentimentColor(strategy.overallSentiment)}`}>
                  {strategy.overallSentiment} · {strategy.sentimentStrength} conviction
                </span>
                <span className="rounded-full bg-surface/60 px-2 py-0.5 text-xs text-secondary capitalize">
                  {strategy.marketCondition}
                </span>
              </div>
              <p className="text-sm text-primary leading-relaxed max-w-2xl">{strategy.recommendation}</p>
            </div>
            <div className="text-right text-xs text-secondary">
              <div className="text-2xl font-bold text-primary">{strategy.positionSizingMultiplier}×</div>
              <div>position sizing</div>
              <div className="mt-1 capitalize">{strategy.riskMode} mode</div>
            </div>
          </div>
          {strategy.keyThemes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {strategy.keyThemes.map(theme => (
                <span key={theme} className="rounded-full border border-border bg-surface/60 px-2 py-0.5 text-xs text-secondary">{theme}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Market Indicators */}
          {marketIndicators.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-secondary">
                <BarChart2 className="h-4 w-4" /> Market Indicators
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {marketIndicators.map(ind => (
                  <div key={ind.symbol} className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-secondary">{ind.name}</div>
                        <div className="text-xl font-bold">{ind.symbol === "VIX" ? ind.price.toFixed(2) : `$${ind.price.toFixed(2)}`}</div>
                      </div>
                      {ind.trend === "up" ? <ArrowUp className="h-4 w-4 text-green-400" /> : ind.trend === "down" ? <ArrowDown className="h-4 w-4 text-red-400" /> : <Minus className="h-4 w-4 text-yellow-400" />}
                    </div>
                    <div className={`mt-1 text-sm font-medium ${ind.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {ind.change >= 0 ? "+" : ""}{ind.change} ({ind.changePercent >= 0 ? "+" : ""}{ind.changePercent}%)
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      <span className={`rounded-full px-2 py-0.5 capitalize ${volatilityBadge(ind.volatilityLabel)}`}>{ind.volatilityLabel} vol</span>
                      <span className="rounded-full bg-surface/60 border border-border px-2 py-0.5 text-secondary">{ind.volumeRatio}× vol</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trading Signals */}
          {strategy && strategy.activeSignals.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-secondary">Active Trading Signals</h2>
              <div className="space-y-2">
                {strategy.activeSignals.map(sig => (
                  <div key={sig.ticker} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
                    <div className="flex-shrink-0">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${signalBadge(sig.signal)}`}>{sig.signal}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">${sig.ticker}</span>
                        <span className="text-xs text-secondary capitalize">({sig.confidence} confidence)</span>
                      </div>
                      <p className="mt-0.5 text-xs text-secondary leading-relaxed">{sig.rationale}</p>
                    </div>
                    <div className="text-right text-xs text-secondary flex-shrink-0">
                      <div className={`font-bold text-sm ${sig.compositeScore >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {sig.compositeScore >= 0 ? "+" : ""}{(sig.compositeScore * 100).toFixed(0)}
                      </div>
                      <div>score</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Financial News */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-secondary">Financial News Feed ({news.length})</h2>
            <div className="space-y-2">
              {news.slice(0, 15).map(item => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-border bg-surface p-4 hover:border-accent/40 transition">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-xs capitalize border ${sentimentBg(item.sentiment)} ${sentimentColor(item.sentiment)}`}>
                      {item.sentiment}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-snug">{item.title}</div>
                      {item.summary && <p className="mt-1 text-xs text-secondary line-clamp-2">{item.summary}</p>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-secondary">
                        <span>{item.source}</span>
                        <span>·</span>
                        <span>{new Date(item.publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {item.tickers.map(t => <span key={t} className="rounded bg-surface border border-border px-1.5 py-0.5 font-mono">${t}</span>)}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Insights */}
          {insights.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-secondary">AI Insights</h2>
              <div className="space-y-3">
                {insights.map((ins, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary">{ins.title}</span>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs ${ins.confidence === "high" ? "bg-green-500/20 text-green-400" : ins.confidence === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {ins.confidence}
                      </span>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">{ins.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Social Signals */}
          {socialSignals.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-secondary">Social Sentiment</h2>
              <div className="space-y-2">
                {socialSignals.slice(0, 6).map((sig, i) => {
                  const pct = Math.round((sig.sentimentScore + 1) / 2 * 100);
                  return (
                    <div key={i} className="rounded-2xl border border-border bg-surface p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold capitalize">{sig.platform}</span>
                          <span className="text-xs text-secondary">· #{sig.keyword}</span>
                        </div>
                        <span className="text-xs text-secondary">{sig.mentionCount} posts</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface overflow-hidden border border-border">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 55 ? "bg-green-500" : pct <= 45 ? "bg-red-500" : "bg-yellow-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-secondary">
                        <span>Bearish {sig.bearishCount}</span>
                        <span className={`font-medium ${pct >= 55 ? "text-green-400" : pct <= 45 ? "text-red-400" : "text-yellow-400"}`}>{pct}% bullish</span>
                        <span>Bullish {sig.bullishCount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Source Status */}
          {sourceStatus && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-secondary">Data Connectors</h2>
              <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
                {Object.entries(sourceStatus).map(([key, status]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${sourceStatusDot(status)}`} />
                      <span className="text-secondary capitalize">{key.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-secondary">
                      {status === "ok" ? <Wifi className="h-3 w-3 text-green-400" /> : status === "disabled" ? <WifiOff className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3 text-yellow-400" />}
                      <span className="capitalize">{status}</span>
                    </div>
                  </div>
                ))}
                {lastFetch > 0 && (
                  <div className="mt-3 pt-2 border-t border-border text-xs text-secondary">
                    Last updated: {new Date(lastFetch).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
