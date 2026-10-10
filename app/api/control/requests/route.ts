import { NextResponse } from 'next/server';
import path from 'node:path';
import { authorize, RequestLedger } from '@/lib/control-plane/requests.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const ledger = () => new RequestLedger(path.join(process.env.DATA_DIR ?? path.join(process.cwd(), 'var'), 'control-requests'));
function failure(error: unknown) {
  const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 500;
  return NextResponse.json({ ok: false, error: status === 500 ? 'Request persistence unavailable' : error instanceof Error ? error.message : 'Request failed' }, { status });
}
export async function POST(request: Request) {
  try {
    authorize(request.headers.get('authorization'), process.env.CONTROL_OPERATOR_KEY);
    const receipt = await ledger().submit(await request.json(), { endpoint: process.env.S_AGENTOS_WEBHOOK_URL, key: process.env.S_AGENTOS_OPERATOR_KEY });
    return NextResponse.json({ ok: true, receipt }, { status: 202 });
  } catch (error) { return failure(error); }
}
export async function GET(request: Request) {
  try {
    authorize(request.headers.get('authorization'), process.env.CONTROL_OPERATOR_KEY);
    const receipt = await ledger().get(new URL(request.url).searchParams.get('requestId') ?? '');
    return NextResponse.json({ ok: Boolean(receipt), receipt }, { status: receipt ? 200 : 404 });
  } catch (error) { return failure(error); }
}
