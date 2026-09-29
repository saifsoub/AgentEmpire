export interface WaitlistSubmission {
  submissionId: string;
  name: string;
  email: string;
  message: string;
  sourceType: "offer" | "asset";
  sourceId: string;
  sourceName: string;
  consentAccepted: true;
  consentText: string;
}

interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

function config(): SupabaseConfig {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Waitlist storage is not configured");
  return { url, serviceRoleKey };
}

async function request(path: string, init: RequestInit) {
  const { url, serviceRoleKey } = config();
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
}

function splitName(name: string) {
  const [firstName, ...remaining] = name.trim().split(/\s+/);
  return { first_name: firstName, last_name: remaining.join(" ") || null };
}

/** Stores only the explicit S/Agency offer/asset capture; it never creates pipeline records. */
export async function storeWaitlistSubmission(input: WaitlistSubmission) {
  const existing = await request(
    `lead_sources?source=eq.agent_empire_capture&source_record_id=eq.${encodeURIComponent(input.submissionId)}&select=id`,
    { method: "GET" },
  );
  if (!existing.ok) throw new Error("Unable to verify submission");
  const matches = (await existing.json()) as Array<{ id: string }>;
  if (matches.length) return { receiptId: input.submissionId, duplicate: true };

  const leadResponse = await request("leads", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...splitName(input.name), email: input.email.trim() }),
  });
  if (!leadResponse.ok) throw new Error("Unable to store lead");
  const [lead] = (await leadResponse.json()) as Array<{ id: string }>;

  const sourceResponse = await request("lead_sources", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      lead_id: lead.id,
      source: "agent_empire_capture",
      source_record_id: input.submissionId,
      purpose: input.sourceType === "offer" ? "agency_offer_interest" : "agency_asset_interest",
      source_type: input.sourceType,
      source_id: input.sourceId,
      source_name: input.sourceName,
      message: input.message || null,
      contact_consent: input.consentAccepted,
      consent_text: input.consentText,
      consented_at: new Date().toISOString(),
    }),
  });
  if (!sourceResponse.ok) {
    await request(`leads?id=eq.${lead.id}`, { method: "DELETE" });
    if (sourceResponse.status === 409) return { receiptId: input.submissionId, duplicate: true };
    throw new Error("Unable to store submission");
  }

  return { receiptId: input.submissionId, duplicate: false };
}
