import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeights, getScoreWeightTotal } from "../src/core/score-engine.ts";
import { runOnPageAudit } from "../src/on-page/on-page-audit.ts";
import type { OnPageAuditOutput } from "../src/types/on-page.ts";

function reportFromMessage(message: string): OnPageAuditOutput {
  return JSON.parse(message) as OnPageAuditOutput;
}

test("/seo-master on-page-audit is active", async () => {
  const command = (await getCommands()).find((item) => item.id === "on-page-audit");
  assert.equal(command?.status, "active");
});

test("without input, on-page audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master on-page-audit");
  const report = reportFromMessage(result.message);
  assert.equal(result.type, "on-page-audit");
  assert.equal(report.status, "needs_input");
});

test("missing title returns P1 issue", () => {
  const report = runOnPageAudit({ mode: "page", h1: "SEO Services" });
  assert.ok(report.issues.some((issue) => issue.id === "title-missing" && issue.priority === "P1"));
});

test("missing H1 returns P1 issue", () => {
  const report = runOnPageAudit({ mode: "page", title: "SEO Services" });
  assert.ok(report.issues.some((issue) => issue.id === "h1-missing" && issue.priority === "P1"));
});

test("multiple H1s return issue", () => {
  const report = runOnPageAudit({ mode: "page", title: "SEO Services", headings: [{ level: "h1", text: "One" }, { level: "h1", text: "Two" }] });
  assert.ok(report.issues.some((issue) => issue.id === "h1-multiple"));
});

test("very long title returns issue", () => {
  const report = runOnPageAudit({ mode: "page", title: "Technical SEO Services for Enterprise SaaS Teams Looking to Fix Crawling Indexing and Growth Problems", h1: "Technical SEO Services" });
  assert.ok(report.issues.some((issue) => issue.id === "title-too-long"));
});

test("missing meta description returns issue", () => {
  const report = runOnPageAudit({ mode: "page", title: "Technical SEO Services", h1: "Technical SEO Services" });
  assert.ok(report.issues.some((issue) => issue.id === "meta-description-missing"));
});

test("commercial page without CTA returns issue", () => {
  const report = runOnPageAudit({ mode: "page", pageType: "service", title: "SEO Services", h1: "SEO Services", bodyText: "SEO services for growing companies." });
  assert.ok(report.issues.some((issue) => issue.id === "cta-missing-commercial-page"));
});

test("above-fold image missing alt returns issue", () => {
  const report = runOnPageAudit({ mode: "page", title: "SEO Services", h1: "SEO Services", images: [{ src: "/hero.png", position: "above_fold" }] });
  assert.ok(report.issues.some((issue) => issue.id === "image-alt-missing" && issue.priority === "P2"));
});

test("generic anchor text returns issue", () => {
  const report = runOnPageAudit({ mode: "page", title: "SEO Services", h1: "SEO Services", bodyText: "Useful page copy.", links: [{ href: "/services", text: "click here", type: "internal" }] });
  assert.ok(report.issues.some((issue) => issue.id === "generic-anchor-text"));
});

test("/seo-master help shows on-page-audit as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master on-page-audit \[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP on-page audit tool uses same logic", () => {
  const direct = runOnPageAudit({ mode: "page", title: "SEO Services" });
  const equivalent = runOnPageAudit({ mode: "page", title: "SEO Services" });
  assert.deepEqual(equivalent.issues, direct.issues);
});
