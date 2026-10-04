# AgentEmpire — plain-language README

## What this is
A dark-themed web dashboard for one person running several businesses at once. It keeps deals, offers, decisions, tasks, content and weekly summaries in one place, along with AI helpers that can do some of the work.

## Who it's for
A solo business owner (Seif) who wants one screen for all his businesses.

## What it does today
The app has these pages:

| Page | Address | What it's for |
|---|---|---|
| Dashboard | `/dashboard` | Key numbers and priorities at a glance |
| Opportunities | `/opportunities` | Track possible deals |
| Offers | `/offers` | Build and manage what you sell |
| Decisions | `/decisions` | Record decisions and suggested next steps |
| Tasks | `/tasks` | To-do items, with a record of who changed what |
| Content | `/content` | Plan and write content |
| Assets | `/assets` | Prepare files and materials |
| Briefings | `/briefings` | Weekly summaries |
| Lifestyle | `/lifestyle` | Personal life planning |
| Agents | `/agents`, `/superpowers` | The AI helpers and the tools each one can use |
| Settings | `/settings` | Your preferences |
| UAE Car Sales | `/uae-car-sales` | An AI helper set up for selling cars in the UAE |

- AI helpers are defined in `lib/agents/definitions.ts`. Each one has a list of what it can do (tasks, content, email drafts, calendar, GitHub issues).
- Risky actions such as sending email, publishing or paying always wait for a human to approve. Emails are only ever drafted; a person has to send them.
- It connects to outside services (Gmail, calendar, GitHub and others) through Composio, an integration service, and uses Anthropic's Claude AI for reasoning.
- If a needed service or password is missing, it shows an error instead of pretending it worked.

## How to run it
```bash
npm ci --no-audit --no-fund   # install exact dependency versions
npm run dev                   # start locally
```
Open http://localhost:7483.

Other useful commands:
```bash
npm run typecheck      # check the code for type mistakes
npm run test           # run automated tests
npm run build          # build for production
npm run deploy:verify  # all of the above in one go
npm run start          # run the production build
```
Put your own keys in a `.env.local` file, which is never committed. Use `.env.example` as the template if it exists.

## Current status and known gaps
- The app builds and has tests.
- Several security alerts are open on its dependencies, including a critical Next.js bug in its image handling. Upgrading to Next.js 15.5.24 or later fixes it.
- It is meant to work alongside S-OS (a command hub) and an n8n automation setup. How much of that link works today is not yet confirmed.
- Where it is hosted live: not yet confirmed.

## Where things live
| Folder | What's in it |
|---|---|
| `app/` | The pages |
| `components/` | Shared screen parts (sidebar, layout) |
| `lib/` | Data storage, AI helpers, tool connections, scoring and input checks |
| `data/` | Saved app data |
| `skills/` | Ready-made know-how packs (e.g. UAE car sales) |
| `docs/` | Longer technical notes |

License: MIT (see `LICENSE`).
