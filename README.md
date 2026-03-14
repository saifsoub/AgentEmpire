# Personal Empire OS

A full-stack, dark-mode Next.js application for managing your personal empire — opportunities, offers, content, assets, decisions, weekly briefings, and lifestyle metrics.

## Architecture

```
app/                    ← Next.js App Router pages & API routes
  api/                  ← REST API endpoints (POST for each entity)
  assets/               ← Asset Factory page
  briefings/            ← Weekly Briefings page
  content/              ← Content Engine page
  dashboard/            ← Dashboard overview page
  decisions/            ← Decision Engine page
  lifestyle/            ← Lifestyle OS page
  offers/               ← Offers page
  opportunities/        ← Opportunities page
  settings/             ← Settings page
components/             ← Shared UI components
  layout/               ← AppShell + Sidebar
lib/                    ← Business logic, types, utilities
  prisma.ts             ← Prisma client singleton (SQLite adapter)
  store.ts              ← All database read/write operations via Prisma
  scoring.ts            ← Opportunity & Empire scoring algorithms
  types.ts              ← TypeScript interfaces
  validators.ts         ← Zod input validators
  utils.ts              ← Formatting helpers
prisma/
  seed.ts               ← Seed script (loads data/demo-db.json)
data/
  demo-db.json          ← Seed data / local demo dataset
schema.prisma           ← Prisma schema (all models)
prisma.config.ts        ← Prisma 7 config (SQLite / adapter setup)
```

## Database

| Environment | Provider   | URL format                          |
|-------------|------------|-------------------------------------|
| Development | SQLite     | `file:./prisma/dev.db`              |
| Production  | PostgreSQL | `postgresql://user:pass@host:5432/db` |

### Switching to PostgreSQL for production

1. Change `provider = "sqlite"` → `provider = "postgresql"` in `schema.prisma`
2. Install the pg adapter: `npm install @prisma/adapter-pg pg @types/pg`
3. Update `lib/prisma.ts` and `prisma.config.ts` to use `PrismaPg` instead of `PrismaBetterSqlite3`
4. Set `DATABASE_URL` to your PostgreSQL connection string

## Setup

### Prerequisites

- Node.js 20+
- npm

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and edit if needed
cp .env.example .env

# 3. Push schema to the local SQLite database
npm run db:push

# 4. Seed the database with demo data
npm run db:seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

| Command          | Description                                        |
|------------------|----------------------------------------------------|
| `npm run dev`    | Start development server                           |
| `npm run build`  | Production build                                   |
| `npm run start`  | Serve production build                             |
| `npm run typecheck` | TypeScript type check                           |
| `npm run db:push`  | Push schema to database (no migration history)   |
| `npm run db:seed`  | Seed database from `data/demo-db.json`           |
| `npm run db:studio` | Open Prisma Studio GUI                          |

## Modules

| Module        | Route          | Description                                         |
|---------------|----------------|-----------------------------------------------------|
| Dashboard     | `/dashboard`   | Empire health score, pillar breakdown, weekly focus |
| Opportunities | `/opportunities` | Ranked list of income streams with scoring        |
| Offers        | `/offers`      | Commercial offers (draft → live)                    |
| Content       | `/content`     | Content engine for authority signals                |
| Assets        | `/assets`      | Asset factory for monetizable IP                    |
| Decisions     | `/decisions`   | Decision analysis with strategic recommendations    |
| Briefings     | `/briefings`   | Weekly strategic briefings (auto-generate)          |
| Lifestyle     | `/lifestyle`   | Lifestyle OS with ROI tracking                      |

## API Endpoints

All endpoints accept `POST` with JSON body and return the created record.

| Endpoint                    | Schema                    |
|-----------------------------|---------------------------|
| `POST /api/opportunities`   | `createOpportunitySchema` |
| `POST /api/offers`          | `createOfferSchema`       |
| `POST /api/content`         | `createContentSchema`     |
| `POST /api/assets`          | `createAssetSchema`       |
| `POST /api/decisions`       | `analyzeDecisionSchema`   |
| `POST /api/briefings/generate` | (no body required)     |

## Environment Variables

See `.env.example` for all supported environment variables.

| Variable            | Required | Default                   | Description               |
|---------------------|----------|---------------------------|---------------------------|
| `DATABASE_URL`      | Yes      | `file:./prisma/dev.db`    | Database connection URL   |
