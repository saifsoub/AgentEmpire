import { AppShell } from "@/components/layout/app-shell";
import { UaeCarSalesClient } from "@/components/uae-car-sales-client";

export default function UaeCarSalesPage() {
  return (
    <AppShell
      pathname="/uae-car-sales"
      title="UAE Car Sales Agent"
      subtitle="AI-powered pricing for the UAE used car market."
    >
      <UaeCarSalesClient />
    </AppShell>
  );
}
