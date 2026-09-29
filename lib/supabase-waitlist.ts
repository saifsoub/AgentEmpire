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

/** One database transaction owns idempotency and both inserts. */
export async function storeWaitlistSubmission(input: WaitlistSubmission) {
  const response = await request("rpc/capture_agency_interest", {
    method: "POST",
    body: JSON.stringify({
      p_submission_id: input.submissionId,
      p_first_name: splitName(input.name).first_name,
      p_last_name: splitName(input.name).last_name,
      p_email: input.email.trim(),
      p_source_type: input.sourceType,
      p_source_id: input.sourceId,
      p_source_name: input.sourceName,
      p_message: input.message || null,
      p_consent_text: input.consentText,
    }),
  });
  if (!response.ok) throw new Error("Unable to store submission");
  const result = (await response.json()) as { receipt_id: string; duplicate: boolean };
  return { receiptId: result.receipt_id, duplicate: result.duplicate };
}
