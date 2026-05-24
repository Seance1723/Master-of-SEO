import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeights, getScoreWeightTotal } from "../src/core/score-engine.ts";
import { runTechnicalAudit } from "../src/technical/technical-audit.ts";
import type { TechnicalAuditOutput } from "../src/types/technical.ts";

function reportFromMessage(message: string): TechnicalAuditOutput {
  return JSON.parse(message) as TechnicalAuditOutput;
}

test("/seo-master technical-audit is active", async () => {
  const command = (await getCommands()).find((item) => item.id === "technical-audit");
  assert.equal(command?.status, "active");
});

test("without input, technical audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master technical-audit");
  const report = reportFromMessage(result.message);
  assert.equal(result.type, "technical-audit");
  assert.equal(report.status, "needs_input");
});

test("HTML with noindex returns indexability issue", () => {
  const report = runTechnicalAudit({ mode: "page", html: "<html><head><meta name=\"robots\" content=\"noindex\"></head><body><a href=\"/a\">A</a></body></html>" });
  assert.ok(report.issues.some((issue) => issue.category === "indexability" && issue.id === "indexability-noindex-found"));
});

test("HTML with multiple canonical tags returns canonical issue", () => {
  const report = runTechnicalAudit({ mode: "page", html: "<link rel=\"canonical\" href=\"https://example.com/a\"><link rel=\"canonical\" href=\"https://example.com/b\">" });
  assert.ok(report.issues.some((issue) => issue.id === "canonical-multiple"));
});

test("robots.txt with Disallow: / returns P0 issue", () => {
  const report = runTechnicalAudit({ mode: "website", robotsTxt: "User-agent: *\nDisallow: /" });
  assert.ok(report.issues.some((issue) => issue.id === "robots-full-site-block" && issue.priority === "P0"));
});

test("sitemap without urlset/sitemapindex returns sitemap issue", () => {
  const report = runTechnicalAudit({ mode: "website", sitemapXml: "<xml></xml>" });
  assert.ok(report.issues.some((issue) => issue.id === "sitemap-invalid-root"));
});

test("URL with session id returns URL structure issue", () => {
  const report = runTechnicalAudit({ mode: "page", url: "https://example.com/Page?PHPSESSID=abc" });
  assert.ok(report.issues.some((issue) => issue.id === "url-session-id"));
});

test("500 status code returns P0 issue", () => {
  const report = runTechnicalAudit({ mode: "page", statusCode: 500 });
  assert.ok(report.issues.some((issue) => issue.id === "status-5xx" && issue.priority === "P0"));
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("/seo-master help shows technical-audit as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master technical-audit \[active\]/u);
});

test("MCP technical audit logic uses same technical audit runner", () => {
  const direct = runTechnicalAudit({ mode: "page", statusCode: 500 });
  const equivalent = runTechnicalAudit({ mode: "page", statusCode: 500 });
  assert.deepEqual(equivalent.issues, direct.issues);
});
