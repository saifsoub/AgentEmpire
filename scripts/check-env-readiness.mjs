#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const REQUIRED_FILES = [
  "package.json",
  "package-lock.json",
  ".env.example",
  "app/layout.tsx",
  "lib/tools/providers.ts",
  "data/demo-db.json"
];

const CORE_ENV = [
  "APP_NAME",
  "APP_URL",
  "NODE_ENV",
  "PORT"
];

const SECRET_ENV = [
  "ANTHROPIC_API_KEY",
  "COMPOSIO_API_KEY",
  "GROQ_API_KEY",
  "JWT_SECRET",
  "SESSION_SECRET"
];

const OPTIONAL_ENV = [
  "BLUECONIC_API_KEY",
  "COMPOSIO_USER_ID",
  "DATABASE_URL",
  "FIGMA_API_TOKEN",
  "GROQ_MODEL",
  "MAILGUN_API_KEY",
  "MCP_AUTH_TOKEN",
  "MCP_SERVER_URL",
  "STRIPE_SECRET_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_URL",
  "TOOL_ROUTER_DEFAULT_PROVIDER",
  "TOOL_ROUTER_ENABLED_PROVIDERS",
  "TWILIO_AUTH_TOKEN",
  "WEBHOOK_ROUTER_TOKEN",
  "WEBHOOK_ROUTER_URL"
];

const checks = [];
const add = (status, label, detail = "") => checks.push({ status, label, detail });

function commandVersion(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function parseEnvExample() {
  if (!existsSync(".env.example")) return new Set();
  const body = readFileSync(".env.example", "utf8");
  return new Set(
    body
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#") && line.includes("="))
      .map(line => line.slice(0, line.indexOf("=")))
  );
}

const nodeVersion = commandVersion("node", ["--version"]);
add(nodeVersion ? "pass" : "fail", "Node.js available", nodeVersion || "Install Node.js before running this app.");

const npmVersion = commandVersion("npm", ["--version"]);
add(npmVersion ? "pass" : "fail", "npm available", npmVersion || "Install npm before installing dependencies.");

for (const file of REQUIRED_FILES) {
  add(existsSync(file) ? "pass" : "fail", `${file} present`, existsSync(file) ? "" : "Missing required repository file.");
}

add(existsSync("node_modules") ? "pass" : "warn", "dependencies installed", existsSync("node_modules") ? "node_modules exists" : "Run npm install before dev/build/test.");

const envExampleKeys = parseEnvExample();
for (const key of [...CORE_ENV, ...SECRET_ENV, ...OPTIONAL_ENV]) {
  add(envExampleKeys.has(key) ? "pass" : "fail", `.env.example documents ${key}`, envExampleKeys.has(key) ? "" : "Add a placeholder so operators know to configure it.");
}

if (!existsSync(".env.local") && !existsSync(".env")) {
  add("warn", "local environment file", "No .env.local or .env file found. Copy .env.example to .env.local for local execution.");
} else {
  add("pass", "local environment file", existsSync(".env.local") ? ".env.local present" : ".env present");
}

const symbol = { pass: "✅", warn: "⚠️", fail: "❌" };
console.log("AgentEmpire environment readiness report\n");
for (const check of checks) {
  console.log(`${symbol[check.status]} ${check.label}${check.detail ? ` — ${check.detail}` : ""}`);
}

const failed = checks.filter(check => check.status === "fail");
const warned = checks.filter(check => check.status === "warn");
console.log(`\nSummary: ${failed.length} failed, ${warned.length} warning(s), ${checks.length - failed.length - warned.length} passed.`);

if (failed.length > 0) process.exit(1);
