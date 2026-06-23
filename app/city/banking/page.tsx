import { AppShell } from "@/components/layout/app-shell";
import { BankingClient } from "@/components/city/banking-client";

export default function BankingPage() {
  return (
    <AppShell pathname="/city/banking" title="S/ Banking" subtitle="End-to-end secure payment gateways for owners. Controllable agent wallets. Human approval, always.">
      <BankingClient />
    </AppShell>
  );
}
