'use client';

import { useCallback, useEffect, useState } from "react";
import { Landmark, Wallet, ShieldCheck, Snowflake, Play, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { Button, Card, Badge, Input } from "@/components/ui";
import type { AgentWallet, StoredAgent, WalletTransaction } from "@/lib/types";
import type { PaymentGateway } from "@/lib/city-banking";

const TX_LABEL: Record<WalletTransaction["type"], string> = {
  TOP_UP: "Top up",
  WITHDRAWAL: "Withdrawal",
  AGENT_SPEND: "Agent spend",
  TRANSFER: "Transfer",
};

const GATEWAY_BADGE: Record<PaymentGateway["status"], string> = {
  connected: "text-emerald-400",
  sandbox: "text-amber-400",
  planned: "text-muted",
};

export function BankingClient() {
  const [wallets, setWallets] = useState<AgentWallet[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [securityLayers, setSecurityLayers] = useState<string[]>([]);
  const [agents, setAgents] = useState<StoredAgent[]>([]);
  const [newWalletAgent, setNewWalletAgent] = useState("");
  const [txWallet, setTxWallet] = useState("");
  const [txType, setTxType] = useState<WalletTransaction["type"]>("TOP_UP");
  const [txAmount, setTxAmount] = useState("");
  const [txMemo, setTxMemo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [bankRes, agentsRes] = await Promise.all([fetch("/api/banking"), fetch("/api/agents")]);
    const bank = await bankRes.json();
    const ag = await agentsRes.json();
    if (bank.ok) {
      setWallets(bank.wallets ?? []);
      setTransactions(bank.transactions ?? []);
      setGateways(bank.gateways ?? []);
      setSecurityLayers(bank.securityLayers ?? []);
    }
    if (ag.ok) setAgents((ag.agents ?? []).filter((a: StoredAgent) => a.enabled));
  }, []);

  useEffect(() => { void load(); }, [load]);

  const post = async (url: string, method: string, body: unknown) => {
    setBusy(true); setError("");
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!data.ok) setError(data.error ?? "Request failed");
    await load();
    setBusy(false);
    return data;
  };

  const openWallet = () => { if (newWalletAgent) void post("/api/banking/wallets", "POST", { agentId: newWalletAgent }); };
  const toggleFreeze = (w: AgentWallet) => { void post(`/api/banking/wallets/${w.id}`, "PATCH", { status: w.status === "ACTIVE" ? "FROZEN" : "ACTIVE" }); };
  const requestTx = () => {
    const amount = Number(txAmount);
    if (!txWallet || !amount || amount <= 0) return;
    void post("/api/banking/transactions", "POST", { walletId: txWallet, type: txType, amount, memo: txMemo, requestedBy: "owner", gateway: txType === "TOP_UP" ? "stripe" : "internal" });
    setTxAmount(""); setTxMemo("");
  };
  const decide = (tx: WalletTransaction, decision: "APPROVED" | "REJECTED") => { void post(`/api/banking/transactions/${tx.id}`, "PATCH", { decision }); };

  const pending = transactions.filter((t) => t.status === "PENDING_APPROVAL");
  const history = transactions.filter((t) => t.status !== "PENDING_APPROVAL");
  const walletById = (walletId: string) => wallets.find((w) => w.id === walletId);
  const walletsWithoutAccount = agents.filter((a) => !wallets.some((w) => w.agentId === a.id));

  return (
    <div className="space-y-6">
      {/* Security charter */}
      <Card className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Security Charter</span>
        </div>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {securityLayers.map((layer) => (
            <li key={layer} className="text-xs leading-relaxed text-secondary">🔒 {layer}</li>
          ))}
        </ul>
      </Card>

      {/* Gateways */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Payment Gateways (owners)</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {gateways.map((g) => (
            <Card key={g.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">{g.name}</span>
                <span className={`text-xs font-semibold uppercase ${GATEWAY_BADGE[g.status]}`}>{g.status}</span>
              </div>
              <div className="mb-1 text-xs text-muted">{g.rail}</div>
              <p className="text-xs text-secondary">{g.security}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Wallets */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Agent Wallets (owner-controlled)</span>
        </div>
        <Card className="mb-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center gap-3">
            <select value={newWalletAgent} onChange={(e) => setNewWalletAgent(e.target.value)} className="rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none">
              <option value="">Open wallet for agent…</option>
              {walletsWithoutAccount.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <Button onClick={openWallet} disabled={busy || !newWalletAgent}>Open Wallet</Button>
            <span className="text-xs text-muted">New wallets open at 0 balance with a daily limit — funds only enter via approved top-ups.</span>
          </div>
        </Card>
        {wallets.length === 0 ? (
          <Card className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">No wallets yet. Open one for an agent above.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {wallets.map((w) => (
              <Card key={w.id} className={`rounded-2xl border p-4 ${w.status === "FROZEN" ? "border-sky-700/60 bg-surface opacity-80" : "border-border bg-surface"}`}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">{w.agentName}</span>
                  <Badge>{w.status === "FROZEN" ? "❄ Frozen" : "Active"}</Badge>
                </div>
                <div className="mb-1 text-2xl font-bold text-primary">{w.balance.toLocaleString()} <span className="text-sm font-medium text-muted">{w.currency}</span></div>
                <div className="mb-3 text-xs text-muted">Daily limit {w.dailyLimit.toLocaleString()} {w.currency} · owner {w.ownerName}</div>
                <Button variant="secondary" disabled={busy} onClick={() => toggleFreeze(w)}>
                  <Snowflake className="mr-1.5 h-3.5 w-3.5" /> {w.status === "ACTIVE" ? "Freeze" : "Unfreeze"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request transaction */}
      <Card className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Play className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Request Movement of Funds</span>
        </div>
        <p className="mb-4 text-xs text-secondary">Every request — top-up, withdrawal, agent spend, or transfer — goes to the approval desk below. Human approval is always requested before any balance changes.</p>
        <div className="flex flex-wrap items-center gap-3">
          <select value={txWallet} onChange={(e) => setTxWallet(e.target.value)} className="rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none">
            <option value="">Select wallet…</option>
            {wallets.map((w) => <option key={w.id} value={w.id}>{w.agentName} ({w.balance} {w.currency})</option>)}
          </select>
          <select value={txType} onChange={(e) => setTxType(e.target.value as WalletTransaction["type"])} className="rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-primary outline-none">
            {(Object.keys(TX_LABEL) as WalletTransaction["type"][]).map((t) => <option key={t} value={t}>{TX_LABEL[t]}</option>)}
          </select>
          <Input type="number" min="1" placeholder="Amount" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} className="w-32" />
          <Input placeholder="Memo (optional)" value={txMemo} onChange={(e) => setTxMemo(e.target.value)} className="w-56" />
          <Button onClick={requestTx} disabled={busy || !txWallet || !txAmount}>Submit for Approval</Button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </Card>

      {/* Approval desk */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Landmark className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Approval Desk — human decision required</span>
          {pending.length > 0 && <Badge>{pending.length} pending</Badge>}
        </div>
        {pending.length === 0 ? (
          <Card className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">No transactions awaiting approval.</Card>
        ) : (
          <div className="space-y-3">
            {pending.map((tx) => {
              const w = walletById(tx.walletId);
              return (
                <Card key={tx.id} className="rounded-2xl border border-amber-600/40 bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-[220px]">
                      <div className="text-sm font-semibold text-primary">{TX_LABEL[tx.type]} · {tx.amount.toLocaleString()} {w?.currency ?? ""}</div>
                      <div className="text-xs text-muted">{w?.agentName ?? tx.walletId} · requested by {tx.requestedBy} · via {tx.gateway}{tx.memo ? ` · “${tx.memo}”` : ""}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Button disabled={busy} onClick={() => decide(tx, "APPROVED")} className="bg-emerald-600 hover:bg-emerald-500">
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button variant="secondary" disabled={busy} onClick={() => decide(tx, "REJECTED")}>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Ledger */}
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary">Transaction Ledger</div>
        {history.length === 0 ? (
          <Card className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">No resolved transactions yet.</Card>
        ) : (
          <Card className="overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-2 font-medium">Agent</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Amount</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => {
                  const w = walletById(tx.walletId);
                  return (
                    <tr key={tx.id} className="border-b border-border/50 text-secondary">
                      <td className="px-4 py-2">{w?.agentName ?? tx.walletId}</td>
                      <td className="px-4 py-2">{TX_LABEL[tx.type]}</td>
                      <td className="px-4 py-2">{tx.amount.toLocaleString()} {w?.currency ?? ""}</td>
                      <td className={`px-4 py-2 font-semibold ${tx.status === "APPROVED" ? "text-emerald-400" : "text-red-400"}`}>{tx.status}</td>
                      <td className="px-4 py-2 text-muted">{tx.rejectionReason ?? tx.memo ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
