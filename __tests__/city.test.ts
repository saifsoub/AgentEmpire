import { describe, it, expect } from "vitest";
import { universityPrograms, getProgram, sessionProgressStep, computeExamScore, examPassed } from "@/lib/city-university";
import { evaluateWalletTransaction, applyTransaction, isOutflow } from "@/lib/city-banking";
import { enrollAgentSchema, createWalletSchema, requestWalletTransactionSchema } from "@/lib/validators";
import { cityLandmarks } from "@/lib/city-world";

describe("S/ University", () => {
  it("exposes the design elevation flagship program", () => {
    expect(getProgram("design-elevation")?.school).toBe("School of Design Engineering");
    expect(universityPrograms.length).toBeGreaterThanOrEqual(3);
  });

  it("session steps reach 100% after completing all sessions", () => {
    for (const program of universityPrograms) {
      const step = sessionProgressStep(program);
      expect(step * program.sessions.length).toBeGreaterThanOrEqual(100);
    }
  });

  it("an under-trained agent cannot pass the exam", () => {
    const program = universityPrograms[0];
    const lowScore = computeExamScore(40);
    expect(examPassed(lowScore, program.passMark)).toBe(false);
  });

  it("a fully trained agent passes the exam", () => {
    const program = universityPrograms[0];
    expect(examPassed(computeExamScore(100), program.passMark)).toBe(true);
  });

  it("clamps exam scores to 0..100", () => {
    expect(computeExamScore(-10)).toBe(0);
    expect(computeExamScore(250)).toBe(100);
  });
});

describe("S/ Banking policy", () => {
  const wallet = { status: "ACTIVE" as const, balance: 100, dailyLimit: 50 };

  it("classifies outflows", () => {
    expect(isOutflow("TOP_UP")).toBe(false);
    expect(isOutflow("AGENT_SPEND")).toBe(true);
    expect(isOutflow("WITHDRAWAL")).toBe(true);
    expect(isOutflow("TRANSFER")).toBe(true);
  });

  it("allows a top-up on an active wallet", () => {
    expect(evaluateWalletTransaction(wallet, { type: "TOP_UP", amount: 500 }).allowed).toBe(true);
  });

  it("blocks everything on a frozen wallet", () => {
    const frozen = { ...wallet, status: "FROZEN" as const };
    expect(evaluateWalletTransaction(frozen, { type: "TOP_UP", amount: 10 }).allowed).toBe(false);
    expect(evaluateWalletTransaction(frozen, { type: "AGENT_SPEND", amount: 10 }).allowed).toBe(false);
  });

  it("blocks spends above the balance", () => {
    const verdict = evaluateWalletTransaction(wallet, { type: "AGENT_SPEND", amount: 150 });
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(/balance/i);
  });

  it("enforces the daily limit including already-approved outflows", () => {
    expect(evaluateWalletTransaction(wallet, { type: "AGENT_SPEND", amount: 30 }, 0).allowed).toBe(true);
    const verdict = evaluateWalletTransaction(wallet, { type: "AGENT_SPEND", amount: 30 }, 30);
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(/daily limit/i);
  });

  it("treats a zero daily limit as unlimited", () => {
    const noLimit = { ...wallet, dailyLimit: 0 };
    expect(evaluateWalletTransaction(noLimit, { type: "AGENT_SPEND", amount: 90 }, 1000).allowed).toBe(true);
  });

  it("rejects non-positive amounts", () => {
    expect(evaluateWalletTransaction(wallet, { type: "TOP_UP", amount: 0 }).allowed).toBe(false);
    expect(evaluateWalletTransaction(wallet, { type: "TOP_UP", amount: -5 }).allowed).toBe(false);
  });

  it("applies transactions in the right direction", () => {
    expect(applyTransaction(100, { type: "TOP_UP", amount: 25 })).toBe(125);
    expect(applyTransaction(100, { type: "AGENT_SPEND", amount: 25 })).toBe(75);
  });
});

describe("S/ City validators", () => {
  it("accepts a valid enrollment", () => {
    expect(enrollAgentSchema.safeParse({ agentId: "agent_1", programId: "design-elevation" }).success).toBe(true);
  });

  it("rejects enrollment without an agent", () => {
    expect(enrollAgentSchema.safeParse({ agentId: "", programId: "design-elevation" }).success).toBe(false);
  });

  it("accepts a valid wallet", () => {
    expect(createWalletSchema.safeParse({ agentId: "agent_1", dailyLimit: 100 }).success).toBe(true);
  });

  it("rejects a transaction with a non-positive amount", () => {
    expect(requestWalletTransactionSchema.safeParse({ walletId: "wallet_1", type: "TOP_UP", amount: 0 }).success).toBe(false);
  });

  it("defaults transaction requester to owner", () => {
    const parsed = requestWalletTransactionSchema.parse({ walletId: "wallet_1", type: "TOP_UP", amount: 50 });
    expect(parsed.requestedBy).toBe("owner");
    expect(parsed.gateway).toBe("internal");
  });
});

describe("S/ City world", () => {
  it("includes the signature landmarks", () => {
    const ids = cityLandmarks.map((l) => l.id);
    expect(ids).toContain("s-sign");
    expect(ids).toContain("sunset-boulevard");
    expect(ids).toContain("executive-beach");
    expect(ids).toContain("s-university");
    expect(ids).toContain("s-banking");
  });
});
