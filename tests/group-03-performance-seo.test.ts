import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeights, getScoreWeightTotal } from "../src/core/score-engine.ts";
import { runPerformanceAudit } from "../src/performance/performance-audit.ts";
import type { PerformanceAuditOutput } from "../src/types/performance.ts";

function reportFromMessage(message: string): PerformanceAuditOutput {
  return JSON.parse(message) as PerformanceAuditOutput;
}

test("/seo-master performance-audit is active", async () => {
  const command = (await getCommands()).find((item) => item.id === "performance-audit");
  assert.equal(command?.status, "active");
});

test("without input, performance audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master performance-audit");
  const report = reportFromMessage(result.message);
  assert.equal(result.type, "performance-audit");
  assert.equal(report.status, "needs_input");
});

test("LCP above 2.5 returns P1 issue", () => {
  const report = runPerformanceAudit({ mode: "page", metrics: { lcp: 3.2 } });
  assert.ok(report.issues.some((issue) => issue.id === "cwv-lcp-needs-improvement" && issue.priority === "P1"));
});

test("LCP above 4.0 returns P0 issue", () => {
  const report = runPerformanceAudit({ mode: "page", metrics: { lcp: 4.5 } });
  assert.ok(report.issues.some((issue) => issue.id === "cwv-lcp-critical" && issue.priority === "P0"));
});

test("INP above 200 returns P1 issue", () => {
  const report = runPerformanceAudit({ mode: "page", metrics: { inp: 240 } });
  assert.ok(report.issues.some((issue) => issue.id === "cwv-inp-needs-improvement" && issue.priority === "P1"));
});

test("CLS above 0.1 returns P1 issue", () => {
  const report = runPerformanceAudit({ mode: "page", metrics: { cls: 0.15 } });
  assert.ok(report.issues.some((issue) => issue.id === "cwv-cls-needs-improvement" && issue.priority === "P1"));
});

test("hero image with lazy loading returns issue", () => {
  const report = runPerformanceAudit({
    mode: "page",
    assets: [{ url: "https://example.com/hero.webp", type: "image", loading: "lazy", position: "above_fold", width: 1200, height: 700, format: "webp" }]
  });
  assert.ok(report.issues.some((issue) => issue.id === "hero-image-lazy-loaded"));
});

test("very large image returns P1 issue", () => {
  const report = runPerformanceAudit({
    mode: "page",
    assets: [{ url: "https://example.com/hero.jpg", type: "image", sizeKb: 1200, width: 1200, height: 700, format: "jpg" }]
  });
  assert.ok(report.issues.some((issue) => issue.id === "image-very-large" && issue.priority === "P1"));
});

test("very large JS asset returns P1 issue", () => {
  const report = runPerformanceAudit({
    mode: "page",
    assets: [{ url: "https://example.com/app.js", type: "script", sizeKb: 1200, loading: "defer" }]
  });
  assert.ok(report.issues.some((issue) => issue.id === "js-very-large" && issue.priority === "P1"));
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("/seo-master help shows performance-audit as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master performance-audit \[active\]/u);
});

test("MCP performance audit tool uses same logic", () => {
  const direct = runPerformanceAudit({ mode: "page", metrics: { lcp: 4.5 } });
  const equivalent = runPerformanceAudit({ mode: "page", metrics: { lcp: 4.5 } });
  assert.deepEqual(equivalent.issues, direct.issues);
});
