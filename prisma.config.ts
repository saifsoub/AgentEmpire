// prisma.config.ts – Prisma 7 configuration
// Docs: https://pris.ly/d/config-datasource
//
// LOCAL DEV  (SQLite):   DATABASE_URL=file:./prisma/dev.db  (set in .env)
//
// PRODUCTION (PostgreSQL / Neon / Supabase / Railway):
//   1. npm install @prisma/adapter-pg pg @types/pg
//   2. Update lib/prisma.ts to use PrismaPg adapter
//   3. Change provider in schema.prisma to "postgresql"
//   4. Set DATABASE_URL to your PostgreSQL connection string

import { config as loadDotenv } from "dotenv";
import { defineConfig } from "prisma/config";
import * as path from "node:path";
import * as fs from "node:fs";

// Load .env so prisma CLI commands can read DATABASE_URL
loadDotenv();

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const filePath = dbUrl.replace(/^file:/, "");
const resolved = path.isAbsolute(filePath)
  ? filePath
  : path.join(process.cwd(), filePath);
const dir = path.dirname(resolved);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export default defineConfig({
  schema: "./schema.prisma",
  datasource: {
    url: dbUrl,
  },
});
