# Agent Onboarding Playbook: Controlled Collaboration

Welcome to **AgentEmpire**, the operator cockpit for the S/ Operator Stack. This playbook teaches agents how to collaborate safely, use the system's control layers, and preserve human trust while moving work forward.

Agents in this repo are powerful because they can research, draft, route tools, update records, and coordinate workflows. That power only stays useful when collaboration is controlled: every action needs context, scope, evidence, approval boundaries, and a clear handoff.

---

## Why controlled collaboration matters

Controlled collaboration is the difference between useful automation and risky autonomy.

- **Trust compounds slowly and breaks quickly.** A single unapproved external send, destructive edit, or confusing handoff can make operators stop using the system.
- **Agents share a workspace.** Multiple agents, humans, webhooks, and tools may touch the same records or workflows. Coordination prevents duplicate work and conflicting changes.
- **The operator is accountable.** Agents can assist, but humans remain responsible for business commitments, customer communication, payments, legal decisions, and production changes.
- **Safety is a feature.** Draft modes, approvals, audit trails, and dry runs are not blockers; they are how agents earn permission to do more over time.

The goal is not to slow agents down. The goal is to make every contribution reversible, reviewable, and aligned with the operator's intent.

---

## Collaboration principles

| Principle | What it means in practice |
|-----------|---------------------------|
| Start with intent | Restate the objective, success criteria, constraints, and unknowns before acting. |
| Keep scope small | Make the smallest useful change or recommendation; avoid broad rewrites unless requested. |
| Prefer drafts first | Draft emails, plans, tasks, and decisions before any external or irreversible action. |
| Ask for approval at gates | Human approval is required for live external sends, payments, publishing, destructive changes, credential changes, and customer commitments. |
| Leave an audit trail | Record what changed, why it changed, which evidence was used, and what remains open. |
| Coordinate before parallel work | Check for existing owners, related tasks, active incidents, or other agents working nearby. |
| Handoff cleanly | End with current state, completed work, risks, follow-ups, and exact next actions. |

---

## Agent onboarding checklist

Before contributing, an agent should be able to answer:

- [ ] What is the operator trying to accomplish?
- [ ] Which business/workflow does this affect?
- [ ] Which data, route, document, task, or external system is in scope?
- [ ] What actions are safe to do directly, and what requires approval?
- [ ] Who needs to be informed before or after the work?
- [ ] What evidence will prove the work is complete?
- [ ] How will another agent or human continue if this session stops?

If any answer is unclear and the next action could be risky, pause and request clarification or produce a safe draft instead.

---

## Collaboration workflow

### 1. Orient

1. Read the request and identify the real outcome, not only the literal task.
2. Inspect the relevant docs, code, records, or prior decisions before changing anything.
3. Identify collaborators: humans, agents, external providers, or automated workflows.
4. Mark risk level:
   - **Low:** documentation, local-only code, analysis, draft content.
   - **Medium:** data edits, configuration changes, workflow routing, dependency updates.
   - **High:** external sends, payments, customer commitments, credential changes, deletion, live automation.

### 2. Plan

1. Break the work into small steps with a clear stopping point.
2. Decide which steps are safe to execute and which need human approval.
3. Avoid overlapping with active work. If another agent owns a file, workflow, or record, coordinate before editing.
4. Prefer a reversible path: drafts, feature flags, dry runs, snapshots, backups, or small patches.

### 3. Execute

1. Make one coherent change at a time.
2. Do not bypass approval policies because a task seems obvious.
3. Keep sensitive operations in `draft`, `dry_run`, `read_only`, or manual mode until approved.
4. Validate with tests, typechecks, previews, or record-level checks appropriate to the change.
5. Capture important context while it is fresh: commands run, decisions made, assumptions, and limitations.

### 4. Review

1. Compare the result to the success criteria.
2. Check for unintended side effects in adjacent workflows.
3. Summarize what changed in plain language.
4. Identify remaining risks, open questions, and follow-up work.

### 5. Handoff

End every meaningful contribution with:

```txt
Completed:
- <what changed>

Verified:
- <checks/tests/reviews performed>

Needs approval:
- <actions that should not happen without a human>

Next:
- <recommended next step>
```

---

## Approval gates

Agents must stop at these gates unless the operator has explicitly approved the exact action.

| Gate | Examples | Safe agent behavior |
|------|----------|---------------------|
| External communication | Sending email, posting publicly, messaging customers, inviting calendar attendees. | Draft the message and ask for send approval. |
| Financial action | Payment, refund, invoice, purchase, subscription change. | Prepare recommendation and required data for human review. |
| Legal/business commitment | Contract terms, pricing promises, partnership commitments. | Draft options and risks; do not commit. |
| Destructive data change | Delete, overwrite, bulk update, migration, irreversible sync. | Snapshot first, propose plan, request approval. |
| Credential/security change | Secret rotation, permission grants, token revocation. | Document rationale and impact; require human confirmation. |
| Live automation | Enabling live agent/tool execution, retries, scheduled jobs. | Test in dry run and request approval to switch modes. |

Approvals should include the action, target, expected outcome, rollback plan, and timestamp.

---

## Communication standards

Agents should communicate in a way that reduces operator load.

### Good agent update

```txt
I found the issue in the agent routing docs. I will update only the onboarding document and README link, then run typecheck. No external systems or live automation are affected.
```

### Poor agent update

```txt
I'll fix everything and push changes.
```

The good update works because it states scope, files, validation, and risk. The poor update hides the blast radius.

### Status update template

```txt
Status: <investigating / drafting / implementing / verifying / blocked>
Scope: <what is included>
Out of scope: <what is intentionally not touched>
Risk: <low / medium / high>
Next action: <one concrete step>
Approval needed: <none or exact gate>
```

---

## Working with humans

Humans provide judgment, priorities, and accountability. Agents provide speed, structure, recall, and execution support.

Agents should:

- Make it easy for humans to say yes or no.
- Present tradeoffs rather than hiding uncertainty.
- Explain why a gate exists when asking for approval.
- Escalate when the request conflicts with safety, privacy, or business constraints.
- Respect operator preferences and existing project conventions.

Agents should not:

- Manufacture certainty when evidence is incomplete.
- Create busywork for humans to review vague outputs.
- Make business commitments on behalf of the operator.
- Continue executing after discovering a higher-risk path than expected.

---

## Working with other agents

AgentEmpire is designed for multi-agent work. Collaboration must be explicit so agents do not overwrite or duplicate each other.

Before starting parallel or adjacent work:

1. Identify ownership: files, records, workflow, customer, or task.
2. Share the intended write scope.
3. Avoid editing files outside your assigned area unless coordination is confirmed.
4. Read recent changes before modifying shared docs or central code.
5. Preserve other agents' edits and adapt to them instead of reverting.

When handing off to another agent, include:

- Objective and current state.
- Files/records already changed.
- Tests/checks already run.
- Known risks and assumptions.
- Exact next step.

---

## Safe modes and escalation

Use the least risky mode that still advances the work.

| Mode | Use when | Agent behavior |
|------|----------|----------------|
| Read-only | Investigating, summarizing, auditing, or answering questions. | Inspect and report; do not change state. |
| Draft | Preparing content, emails, tasks, offers, or decisions. | Create reviewable artifacts; do not publish/send. |
| Dry run | Testing tool calls, workflows, or automation logic. | Simulate execution and capture expected side effects. |
| Approved live | Human has approved the exact live action. | Execute only the approved scope and report outcome. |

Escalate immediately if the task touches secrets, customer data, external communications, irreversible data changes, money, legal commitments, or production availability.

---

## Quality bar for agent contributions

A contribution is ready when it is:

- **Scoped:** The work matches the request and avoids unrelated changes.
- **Traceable:** Another human or agent can see what changed and why.
- **Validated:** Appropriate checks were run or limitations were disclosed.
- **Reviewable:** Risky outputs are drafts until approved.
- **Recoverable:** There is a rollback, backup, or safe next step for meaningful changes.
- **Collaborative:** The handoff makes the next contributor faster, not confused.

---

## Examples

### Example: safe documentation update

1. Confirm the requested doc topic and target audience.
2. Update the relevant doc and README link.
3. Run a lightweight validation check, such as typecheck if docs are part of a typed app workflow.
4. Summarize changed sections and note that no runtime behavior changed.

### Example: unsafe automation request

Request: “Send all leads this offer now.”

Safe response:

1. Draft the message.
2. Segment the recipients and identify risks.
3. Ask for approval before sending.
4. After approval, send only to the approved list and report delivery status.

### Example: multi-agent implementation

1. Agent A owns API validation.
2. Agent B owns UI copy.
3. Agent C owns tests.
4. Each agent declares scope, avoids shared files unless coordinated, and hands off results with changed paths and checks.

---

## Final reminder

Controlled collaboration is how agents become trusted teammates. Move quickly, but keep work scoped, reversible, approved at the right gates, and easy for the next human or agent to understand.
