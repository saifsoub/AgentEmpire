# Environment readiness runbook

This runbook removes the execution blocker described in DONEAI-53/DONEAI-54: before a human or agent starts implementation work, the workspace should prove that the repository, runtime, and expected configuration surface are ready.

## Fast readiness check

```bash
npm run readiness
```

The command checks:

- Node.js and npm are available.
- Required repository files are present.
- Dependencies have been installed.
- `.env.example` documents every environment variable currently referenced by the app.
- A local `.env.local` or `.env` exists for local execution.

A missing local env file is a warning, not a failure, because CI and hosted platforms usually inject secrets directly.

## Fresh workspace bootstrap

```bash
npm install
cp .env.example .env.local
npm run readiness
npm run typecheck
npm run test
npm run dev
```

Open <http://localhost:7483> after `npm run dev` starts.

## Environment variable map

| Variable | Required for | Secret? | Notes |
| --- | --- | --- | --- |
| `APP_NAME` | App metadata | No | Defaults to `AgentEmpire`. |
| `APP_URL` | Absolute app links / deployment metadata | No | Use `http://localhost:7483` locally. |
| `PORT` | Local runtime | No | `npm run dev` uses port `7483`. |
| `NODE_ENV` | Runtime mode | No | `development`, `test`, or `production`. |
| `ANTHROPIC_API_KEY` | UAE car sales agent live LLM path | Yes | Missing key uses mock output. |
| `GROQ_API_KEY` | Superpowers live LLM path | Yes | Missing key uses mock output. |
| `GROQ_MODEL` | Groq model selection | No | Defaults to `llama-3.3-70b-versatile`. |
| `COMPOSIO_API_KEY` | Connected email/calendar/GitHub tools | Yes | Missing key marks Composio as unconfigured. |
| `COMPOSIO_USER_ID` | Composio user routing | No | Defaults to `seif`. |
| `WEBHOOK_ROUTER_URL` | External automation webhook provider | No | Needed only when webhook provider is enabled. |
| `WEBHOOK_ROUTER_TOKEN` | Webhook authorization | Yes | Sent as bearer token when present. |
| `MCP_SERVER_URL` | MCP provider and tool discovery | No | Needed only for MCP-backed tools. |
| `MCP_AUTH_TOKEN` | MCP authorization | Yes | Sent as bearer token when present. |
| `TOOL_ROUTER_DEFAULT_PROVIDER` | Tool routing | No | Defaults to `native`. |
| `TOOL_ROUTER_ENABLED_PROVIDERS` | Tool discovery/status | No | Defaults to `native,manual`. |
| `DATABASE_URL` | Future Prisma/Postgres path | Yes | Demo mode currently persists to `data/demo-db.json`. |
| `SUPABASE_URL` | Future Supabase path | No | Configure when S-OS/Supabase integration is activated. |
| `SUPABASE_ANON_KEY` | Future Supabase browser/client path | Yes | Treat as secret for this project. |
| `SUPABASE_SERVICE_ROLE_KEY` | Future Supabase server path | Yes | Server-only. Never expose to browser. |
| `JWT_SECRET` | Auth/session signing | Yes | Use at least 32 random bytes. |
| `SESSION_SECRET` | Session signing/encryption | Yes | Use at least 32 random bytes. |
| `BLUECONIC_API_KEY` | External service integration | Yes | Optional until integration is enabled. |
| `FIGMA_API_TOKEN` | External design integration | Yes | Optional until integration is enabled. |
| `STRIPE_SECRET_KEY` | Payment integration | Yes | Optional until payments are enabled. |
| `MAILGUN_API_KEY` | Email integration | Yes | Optional until email sending is enabled. |
| `TWILIO_AUTH_TOKEN` | SMS/WhatsApp integration | Yes | Optional until messaging is enabled. |

## Definition of ready

The environment is ready for execution when:

1. `npm run readiness` has no failures.
2. `npm run typecheck` passes.
3. `npm run test` passes.
4. Any optional provider needed for the specific task is configured and visible from `/api/tools/status`.
5. No real secret values are committed to git.

## Troubleshooting

- If `npm run readiness` warns that dependencies are missing, run `npm install`.
- If a provider reports `missing_connector`, add the relevant key in the hosting provider secret store or local `.env.local`.
- If a secret is accidentally committed, rotate it immediately and remove it from git history before continuing.
