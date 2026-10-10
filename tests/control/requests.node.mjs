import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { RequestLedger, authorize, prepareRequest, kernelEndpoint } from '../../lib/control-plane/requests.mjs';
const input = { requestId: 'S_UNIFY_20261010_001', objective: 'Inspect evidence', workerId: '83352' };
const options = { endpoint: 'https://kernel.example/webhook', key: 'test-only', fetcher: async () => new Response('{}', { status: 200 }) };
async function fixture(t) { const dir = await mkdtemp(path.join(os.tmpdir(), 's-control-')); t.after(() => rm(dir, { recursive: true, force: true })); return new RequestLedger(dir); }
test('authentication fails closed', () => { assert.throws(() => authorize(null, undefined), /not configured/); assert.throws(() => authorize('Bearer wrong', 'right'), /Unauthorized/); authorize('Bearer right', 'right'); });
test('canonical command keeps shared IDs and only allows dry run', () => { const c = prepareRequest(input); assert.equal(c.trace_id, 'trace_' + input.requestId); assert.equal(c.run_mode, 'dry_run'); assert.throws(() => prepareRequest({ ...input, run_mode: 'live' }), /Unsupported/); assert.throws(() => prepareRequest({ ...input, requestId: '../escape' }), /stable/); });
test('endpoint rejects insecure hosts and embedded credentials', () => { for (const url of ['http://remote.example', 'https://user:secret@example.com', 'https://example.com?token=secret']) assert.throws(() => kernelEndpoint(url)); assert.equal(kernelEndpoint('http://localhost:5678/command'), 'http://localhost:5678/command'); });
test('HTTP success is prepared, durable and replayed without dispatch', async t => { const ledger = await fixture(t); let calls = 0; const o = { ...options, fetcher: async (_url, init) => { calls++; assert.equal(JSON.parse(init.body).run_mode, 'dry_run'); return new Response('{}'); } }; const result = await ledger.submit(input, o); assert.equal(result.state, 'prepared'); assert.equal((await new RequestLedger(ledger.directory).submit(input, o)).replayed, true); assert.equal(calls, 1); });
test('duplicate ID cannot change objective', async t => { const ledger = await fixture(t); await ledger.submit(input, options); await assert.rejects(ledger.submit({ ...input, objective: 'Different' }, options), /another command/); });
test('ambiguous dispatch never retries POST', async t => { const ledger = await fixture(t); let calls = 0; const o = { ...options, fetcher: async () => { calls++; throw new Error('timeout'); } }; assert.equal((await ledger.submit(input, o)).state, 'unconfirmed'); assert.equal((await ledger.submit(input, o)).state, 'unconfirmed'); assert.equal(calls, 1); });
test('two concurrent processes share one atomic claim', async t => { const ledger = await fixture(t); let calls = 0; const o = { ...options, fetcher: async () => { calls++; return new Response('{}'); } }; const results = await Promise.allSettled([ledger.submit(input, o), new RequestLedger(ledger.directory).submit(input, o)]); assert.equal(calls, 1); assert.ok(results.some(x => x.status === 'fulfilled')); });
test('missing credential does not leave a claim', async t => { const ledger = await fixture(t); await assert.rejects(ledger.submit(input, { ...options, key: '' }), /credential/); assert.equal(await ledger.get(input.requestId), null); });
