import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runFinalMasterReport } from "../src/reporting-governance/final-master-report.ts";
import { runReleaseSEOGuard } from "../src/reporting-governance/release-seo-guard.ts";
import { getSeoChangelogTemplate } from "../src/reporting-governance/seo-changelog.ts";
import { runSEOMeasurement } from "../src/reporting-governance/seo-measurement.ts";
import { runSEOQAChecklist } from "../src/reporting-governance/seo-qa-checklist.ts";

for (const id of ["report", "seo-report", "measurement-report", "governance-check", "seo-qa", "release-seo-check", "final-status"]) {
  test(`/seo-master ${id} is active`, async () => {
    assert.equal((await getCommands()).find((command) => command.id === id)?.status, "active");
  });
}

test("without input, report returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master report");
  assert.equal(result.type, "reporting-governance");
  assert.equal((result.data as ReturnType<typeof runSEOMeasurement>).status, "needs_input");
});

test("seo-qa returns generic checklist even without input", async () => {
  const result = await runSeoMaster("/seo-master seo-qa");
  assert.equal(result.type, "reporting-governance");
  assert.ok((result.data as ReturnType<typeof runSEOMeasurement>).qaChecklist.length > 10);
});

test("missing GSC data returns recommendation", () => {
  const report = runSEOMeasurement({ ga4: { organicSessions: 10 } });
  assert.ok(report.issues.some((issue) => issue.id === "missing-search-console-data" && issue.priority === "P3"));
});

test("missing GA4 data returns recommendation", () => {
  const report = runSEOMeasurement({ searchConsole: { clicks: 10 } });
  assert.ok(report.issues.some((issue) => issue.id === "missing-ga4-data" && issue.priority === "P3"));
});

test("high impressions low CTR creates opportunity", () => {
  const report = runSEOMeasurement({ searchConsole: { impressions: 2000, ctr: 0.5 }, ga4: {} });
  assert.ok(report.searchConsoleFindings.some((finding) => JSON.stringify(finding).includes("high_impression_low_ctr")));
});

test("average position 11-20 creates page-2 opportunity", () => {
  const report = runSEOMeasurement({ searchConsole: { averagePosition: 12 }, ga4: {} });
  assert.ok(report.searchConsoleFindings.some((finding) => JSON.stringify(finding).includes("page_2_opportunity")));
});

test("sessions with zero conversions creates conversion issue", () => {
  const report = runSEOMeasurement({ searchConsole: {}, ga4: { landingPages: [{ url: "/seo", sessions: 150, conversions: 0 }] } });
  assert.ok(report.issues.some((issue) => issue.id === "traffic-no-conversions"));
});

test("content decay detected when previous clicks/sessions drop by 20%+", () => {
  const report = runSEOMeasurement({ contentPerformance: [{ url: "/old", clicks: 80, previousClicks: 100 }] });
  assert.ok(report.issues.some((issue) => issue.id === "content-decay"));
});

test("LCP > 2.5 returns issue", () => {
  assert.ok(runSEOMeasurement({ coreWebVitals: { lcp: 3 } }).issues.some((issue) => issue.id === "cwv-LCP"));
});

test("INP > 200 returns issue", () => {
  assert.ok(runSEOMeasurement({ coreWebVitals: { inp: 250 } }).issues.some((issue) => issue.id === "cwv-INP"));
});

test("CLS > 0.1 returns issue", () => {
  assert.ok(runSEOMeasurement({ coreWebVitals: { cls: 0.2 } }).issues.some((issue) => issue.id === "cwv-CLS"));
});

test("spam backlink returns backlink risk", () => {
  const report = runSEOMeasurement({ backlinks: { links: [{ sourceUrl: "https://spam.example", isSpam: true }] } });
  assert.ok(report.issues.some((issue) => issue.id === "backlink-risk"));
});

test("ecommerce revenue missing returns tracking recommendation", () => {
  const report = runSEOMeasurement({ business: { websiteType: "ecommerce" }, ga4: {} });
  assert.ok(report.issues.some((issue) => issue.id === "missing_revenue_tracking"));
});

test("SaaS conversion missing returns tracking recommendation", () => {
  const report = runSEOMeasurement({ business: { websiteType: "saas" }, ga4: {} });
  assert.ok(report.issues.some((issue) => issue.id === "missing_saas_conversion_tracking"));
});

test("KPI mapping works for SaaS", () => {
  assert.match(JSON.stringify(runSEOMeasurement({ business: { websiteType: "saas" } }).kpis), /demo requests/u);
});

test("KPI mapping works for ecommerce", () => {
  assert.match(JSON.stringify(runSEOMeasurement({ business: { websiteType: "ecommerce" } }).kpis), /organic revenue/u);
});

test("KPI mapping works for local business", () => {
  assert.match(JSON.stringify(runSEOMeasurement({ business: { websiteType: "local_business" } }).kpis), /direction clicks/u);
});

test("governance missing SEO QA returns issue", () => {
  const report = runSEOMeasurement({ governance: { hasSeoQaProcess: false } });
  assert.ok(report.issues.some((issue) => issue.id === "governance-seo_qa_process" && issue.priority === "P1"));
});

test("governance missing redirect policy returns issue", () => {
  const report = runSEOMeasurement({ governance: { hasRedirectPolicy: false } });
  assert.ok(report.issues.some((issue) => issue.id === "governance-redirect_policy"));
});

test("high-risk pending URL change blocks or needs review", () => {
  const report = runReleaseSEOGuard({ governance: { pendingChanges: [{ type: "url_change", riskLevel: "high" }] } });
  assert.ok(JSON.stringify(report.releaseRiskFindings).includes("blocked"));
});

test("release guard returns blocked when P0/P1 risks exist", () => {
  const report = runReleaseSEOGuard({ governance: { pendingChanges: [{ type: "url_change", riskLevel: "high" }] } });
  assert.ok(report.issues.some((issue) => issue.category === "release" && issue.priority === "P1"));
});

test("SEO changelog template includes date, owner, affected URLs, reason, impact, rollback", () => {
  const template = getSeoChangelogTemplate();
  assert.ok(template.date);
  assert.ok(template.owner);
  assert.ok(template.affectedUrls);
  assert.ok(template.reason);
  assert.ok(template.expectedImpact);
  assert.ok(template.rollbackNote);
});

test("final status combines audit, strategy, measurement, and governance", () => {
  const report = runFinalMasterReport({ websiteAudit: { score: 88, grade: "B" }, seoStrategy: { roadmap: { first30Days: ["Fix metadata"] } }, searchConsole: { clicks: 100 }, ga4: { conversions: 3 }, governance: { hasSeoQaProcess: true } });
  assert.equal((report.finalReport as { currentStatus: { score: number } }).currentStatus.score, 88);
  assert.ok(report.roadmapProgress.length > 0);
});

test("/seo-master help shows all Group 18 commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  for (const command of ["report", "seo-report", "measurement-report", "governance-check", "seo-qa", "release-seo-check", "final-status"]) {
    assert.match(result.message, new RegExp(`/seo-master ${command}\\s+\\[active\\]`, "u"));
  }
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP reporting/governance tools use same logic surface", () => {
  assert.ok(runSEOMeasurement({ searchConsole: { averagePosition: 12 } }).searchConsoleFindings.length > 0);
  assert.ok(runSEOQAChecklist().qaChecklist.length > 0);
});

