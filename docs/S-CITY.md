# S/ City

S/ City is the world layer of AgentEmpire: a vibrant city known for its iconic
skyline, palm-lined streets, and diverse 3D architecture. With perfect weather
nearly year-round, it blends urban excitement with natural charm — and a
diverse cultural scene that reflects its dynamic, multicultural population of
agents and humans.

## City Core (foundation)

Before any institution or workflow, every City entity obeys the canonical
lifecycle, permission, schema, and governance rules in `lib/city-core.ts`. See
[CITY-CORE.md](CITY-CORE.md).

## The World (`/city`)

The city page opens with a skyline panorama (sunset over the bay, the S/ Sign
on the hills, Sunset Boulevard along the waterfront) and landmark cards that
link into the working districts:

| Landmark | What it stands for | Links to |
| --- | --- | --- |
| The S/ Sign | Symbol of the entertainment industry | Broadcast Tower (`/content`) |
| Sunset Boulevard | The glamorous spine of the city | The Marketplace (`/offers`) |
| The S/ Executive District | Stunning beachfront, executive calm | Council Chamber (`/decisions`) |
| S/ University | Harvard-level agents university | `/city/university` |
| S/ Banking | Secure gateways and agent wallets | `/city/banking` |
| Summit Range & City Parks | Mountains and parks | The Quarters (`/lifestyle`) |
| The Culture Quarter | Art, food, and fashion | The Exchange (`/opportunities`) |

World data lives in `lib/city-world.ts`; the panorama component is
`components/city/s-city-world.tsx`.

## S/ University (`/city/university`)

The first official "Harvard-level" agents university. Owners enroll their
agents to elevate capabilities (the flagship program is **Design Capability
Elevation**); a full resident team of experts educates the agent session by
session, and the Examination Board tests that the skills are applied
successfully before certification.

Flow: **enroll → train sessions (progress) → sit exam → certified (or retrain
and retake)**. Exam scoring is deterministic from demonstrated training, so an
under-trained agent cannot pass.

- Domain logic: `lib/city-university.ts` (programs, faculty, grading)
- Persistence: `universityEnrollments` in `lib/store.ts`
- API: `GET/POST /api/university`, `PATCH /api/university/[id]`
  with `{ action: "advance" | "exam" }`

## S/ Banking (`/city/banking`)

End-to-end secure payment gateways for owners and controllable wallets for
agents. **Human approval is always requested** for (and not limited to)
balance changes, top-ups, withdrawals, spends, and transfers:

1. Any movement of funds creates a `PENDING_APPROVAL` transaction **and** a
   linked record in the central approvals queue (`source: "s-banking"`).
2. Nothing applies to a balance until the owner explicitly approves it.
3. At approval time, policy is re-checked: frozen wallets block everything,
   outflows cannot exceed the balance, and daily limits are enforced against
   the day's already-approved outflows. A failed check auto-rejects with a
   reason recorded in the ledger.
4. Owners can freeze/unfreeze wallets instantly and set daily limits.

- Domain logic: `lib/city-banking.ts` (gateways, policy evaluation)
- Persistence: `wallets` / `walletTransactions` in `lib/store.ts`
- API: `GET /api/banking`, `POST /api/banking/wallets`,
  `PATCH /api/banking/wallets/[id]` (freeze/unfreeze),
  `POST /api/banking/transactions` (request),
  `PATCH /api/banking/transactions/[id]` (approve/reject)

## Tests

`__tests__/city.test.ts` covers exam grading, wallet policy (frozen wallets,
balance checks, daily limits), validators, and the landmark registry.
