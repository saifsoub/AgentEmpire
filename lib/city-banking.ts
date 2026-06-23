// S/ Banking — end-to-end secure payment gateways for owners and
// controllable wallets for agents. Human approval is always requested for
// (and not limited to) balance changes, top-ups, withdrawals, and spends:
// every transaction is created PENDING_APPROVAL and only applies after an
// explicit owner decision.

import type { AgentWallet, WalletTransaction } from '@/lib/types';

export type PaymentGateway = {
  id: string;
  name: string;
  rail: string;
  status: 'connected' | 'sandbox' | 'planned';
  security: string;
};

export const paymentGateways: PaymentGateway[] = [
  { id: 'stripe', name: 'Stripe', rail: 'Cards & subscriptions', status: 'sandbox', security: 'Tokenized cards, webhook signature verification' },
  { id: 'paypal', name: 'PayPal', rail: 'Wallet & checkout', status: 'planned', security: 'OAuth-scoped, no stored credentials' },
  { id: 'bank-transfer', name: 'Bank Transfer', rail: 'AED / international wire', status: 'planned', security: 'Manual two-step confirmation' },
];

export const bankingSecurityLayers = [
  'Every balance change, top-up, or spend creates a pending approval — nothing moves without a human decision.',
  'Wallets are owner-controlled: freeze instantly, set daily limits, revoke at any time.',
  'Daily limits are enforced at approval time against the day’s already-approved outflows.',
  'A full transaction ledger links each movement to its approval record.',
];

export const WALLET_OUTFLOW_TYPES: WalletTransaction['type'][] = ['WITHDRAWAL', 'AGENT_SPEND', 'TRANSFER'];

export function isOutflow(type: WalletTransaction['type']) {
  return WALLET_OUTFLOW_TYPES.includes(type);
}

// Pure policy check, evaluated at the moment a human approves a transaction.
// `approvedOutflowToday` is the sum of already-approved outflows for the
// wallet on the same day, used to enforce the daily limit.
export function evaluateWalletTransaction(
  wallet: Pick<AgentWallet, 'status' | 'balance' | 'dailyLimit'>,
  tx: Pick<WalletTransaction, 'type' | 'amount'>,
  approvedOutflowToday = 0,
): { allowed: boolean; reason?: string } {
  if (!Number.isFinite(tx.amount) || tx.amount <= 0) return { allowed: false, reason: 'Amount must be a positive number.' };
  if (wallet.status === 'FROZEN') return { allowed: false, reason: 'Wallet is frozen by the owner.' };
  if (isOutflow(tx.type)) {
    if (tx.amount > wallet.balance) return { allowed: false, reason: 'Insufficient wallet balance.' };
    if (wallet.dailyLimit > 0 && approvedOutflowToday + tx.amount > wallet.dailyLimit) {
      return { allowed: false, reason: `Daily limit of ${wallet.dailyLimit} would be exceeded.` };
    }
  }
  return { allowed: true };
}

export function applyTransaction(balance: number, tx: Pick<WalletTransaction, 'type' | 'amount'>) {
  return isOutflow(tx.type) ? balance - tx.amount : balance + tx.amount;
}
