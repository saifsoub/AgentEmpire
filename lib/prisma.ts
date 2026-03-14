import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as path from "node:path";
import * as fs from "node:fs";

function resolveSqliteUrl(): string {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  // Keep the file: prefix; ensure the directory exists
  const filePath = url.replace(/^file:/, "");
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return resolved;
}

function createPrismaClient() {
  const dbPath = resolveSqliteUrl();
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
