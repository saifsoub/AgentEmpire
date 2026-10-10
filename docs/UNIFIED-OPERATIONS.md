# S/ unified operations — 2026-10-10

The owner authorized consolidating existing assets and granted Lucas the missing execution-board write permission. This change reuses CP-02 snapshot and overview code from draft PR39 without overwriting newer main runtime or city work.

| Component | Responsibility | Verified connection |
| --- | --- | --- |
| AgentEmpire /control | Single operator cockpit | Source implemented; deployment not verified |
| Lucas monday agent 83352 | Intake, role routing, handoffs, evidence review | ACTIVE; plan reread; board5103012225 READ_WRITE reread |
| Live Command Sheet | Portfolio, workforce identities, activity index | Native Sheets reads verified; no automatic sync claimed |
| S/ Agent Passport | Worker activation eligibility | Lucas runtime passport binding not yet verified |
| monday board5103012225 / item3198777766 | Lucas coordination records | Preserve specialist evidence locations |
| S-OS kernel | Governed execution | Current main command schema retrieved; live host not connected |
| ClickUp | Optional project adapter | Not connected or tested by this change |

## Request lifecycle

Authenticated POST /api/control/requests accepts exactly requestId, objective and workerId. It creates the current S-OS command envelope, fixes run_mode to dry_run, propagates command/trace/idempotency identifiers, and uses the existing server-only webhook URL and X-AgentOS-Key credential. Operator authorization uses a separate CONTROL_OPERATOR_KEY. Neither key appears in the browser, ledger or response.

Request claims use atomic directory creation on the canonical private Linux Node persistent volume. The record is written before network I/O; concurrent or repeated submissions cannot make a second POST. A changed command under the same ID returns409. Unknown or crashed dispatch remains unconfirmed and requires reconciliation; there is no automatic resend. Reads return the existing request receipt. An HTTP success is only prepared, never completed or evidence of live worker output.

Keep DATA_DIR on a private persistent volume shared by all processes. Atomic rename prevents torn receipt writes; filesystem errors propagate rather than reporting success. This does not provide a distributed multi-host database. The legacy empire store now propagates write/read failures and writes via atomic replacement, but concurrent read-modify-write transactions across existing routes remain a separate limitation.

## Acceptance evidence

Eight dependency-free tests cover auth, envelope constraints, endpoint safety, durable replay, changed-command conflict, ambiguous network response, concurrent claims, and missing credentials. Run npm run test:control. Next typecheck/build and existing Vitest suite require the repository's Node22/npm10 dependencies. Dependency installation in this session was blocked by registry access; no full build is claimed.

## Live activation gap

Do not cut over from dry-run to live by changing a string. A local historical S-OS execution directory was found, but execution/src/protocol.js was absent from the current GitHub main. It is not accepted deployed runtime evidence. Establish the accepted runtime commit and private endpoint, canonical Lucas/worker passport and signed approval bindings, then verify real worker receipts and outputs end-to-end. Preserve existing active/inactive worker states. An enqueue alone is insufficient. No production deployment or unified live completion is claimed by this source PR.

The native generic provider formerly returned executed with completedInternally=true without doing work. It now reports missing_connector for unimplemented capabilities. Other webhook/MCP legacy routes still need governed receipt validation before they can serve as live execution evidence; /control does not enable them.
