import { createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,96}$/.test(value);
export function authorize(header, key) {
  if (!key) fail('Operator access is not configured', 503);
  const expected = Buffer.from(`Bearer ${key}`), actual = Buffer.from(header ?? '');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) fail('Unauthorized', 401);
}
export function prepareRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Request required');
  if (Object.keys(input).some(k => !['requestId', 'objective', 'workerId'].includes(k))) fail('Unsupported request field');
  if (!validId(input.requestId)) fail('A stable requestId is required');
  if (!validId(input.workerId)) fail('Explicit worker identity required');
  if (typeof input.objective !== 'string' || !input.objective.trim() || input.objective.length > 2000) fail('Invalid objective');
  return {
    command_id: `cmd_${input.requestId}`, trace_id: `trace_${input.requestId}`,
    idempotency_key: input.requestId, action: 'execute_task', objective: input.objective.trim(),
    requested_by: 'agentempire', run_mode: 'dry_run', approval_status: 'not_required',
    agent_id: input.workerId, context: { request_id: input.requestId },
    metadata: { source: 'S/ Control Plane', coordinator: 'monday:83352' },
  };
}
export function kernelEndpoint(value) {
  let url;
  try { url = new URL(value); } catch { fail('S-OS endpoint is not configured', 503); }
  if (url.username || url.password || url.search || url.hash || !(url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) fail('Invalid S-OS endpoint', 503);
  return url.toString();
}

// Atomic mkdir is the cross-process claim. Persist before network I/O. A crash or
// timeout is ambiguous and MUST NOT cause a second POST for this requestId.
export class RequestLedger {
  constructor(directory) { this.directory = directory; }
  location(id) { if (!validId(id)) fail('Invalid requestId'); return path.join(this.directory, id); }
  async get(id) {
    try { return JSON.parse(await readFile(path.join(this.location(id), 'receipt.json'), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }
  async save(id, record) {
    const folder = this.location(id), temporary = path.join(folder, `${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify(record), { mode: 0o600 });
    await rename(temporary, path.join(folder, 'receipt.json'));
  }
  async submit(input, { endpoint, key, fetcher = fetch }) {
    const command = prepareRequest(input);
    const target = kernelEndpoint(endpoint);
    if (!key) fail('S-OS operator credential is not configured', 503);
    const hash = createHash('sha256').update(JSON.stringify(command)).digest('hex');
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    try { await mkdir(this.location(input.requestId), { mode: 0o700 }); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const previous = await this.get(input.requestId);
      if (!previous) fail('Request claim requires reconciliation; it will not be resent', 409);
      if (previous.commandHash !== hash) fail('requestId already belongs to another command', 409);
      return { ...previous, replayed: true };
    }
    const receipt = { requestId: input.requestId, commandHash: hash, workerId: command.agent_id, objective: command.objective, state: 'dispatching', observedAt: new Date().toISOString(), runMode: 'dry_run', replayed: false };
    await this.save(input.requestId, receipt);
    try {
      const response = await fetcher(target, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000), headers: { 'content-type': 'application/json', 'X-AgentOS-Key': key, 'idempotency-key': input.requestId }, body: JSON.stringify(command) });
      // HTTP 200, a simulation, or enqueue is not proof of worker completion.
      receipt.state = response.ok ? 'prepared' : 'rejected';
      receipt.httpStatus = response.status;
      receipt.note = response.ok ? 'Kernel accepted a dry-run request. No live work is claimed.' : 'Kernel rejected the dry-run request.';
      await response.body?.cancel();
    } catch {
      receipt.state = 'unconfirmed';
      receipt.note = 'No confirmed kernel response; reconcile before any retry.';
    }
    receipt.observedAt = new Date().toISOString();
    await this.save(input.requestId, receipt);
    return receipt;
  }
}
