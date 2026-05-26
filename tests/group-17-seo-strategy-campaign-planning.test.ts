import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runLaunchChecklist } from "../src/strategy/launch-checklist.ts";
import { runMigrationPlan } from "../src/strategy/migration-plan.ts";
import { runSEOStrategy } from "../src/strategy/seo-strategy.ts";

for (const id of ["seo-plan", "seo-strategy", "seo-campaign-plan", "opportunity-plan", "launch-checklist", "migration-plan"]) {
  test(`/seo-master ${id} is active`, async () => {
    assert.equal((await getCommands()).find((command) => command.id === id)?.status, "active");
  });
}

test("without input, SEO strategy returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master seo-plan");
  assert.equal(result.type, "seo-strategy");
  assert.equal((result.data as ReturnType<typeof runSEOStrategy>).status, "needs_input");
});

test("business goal maps ecommerce to sales strategy", () => {
  const report = runSEOStrategy({ business: { websiteType: "ecommerce", businessGoals: ["sales"] } });
  assert.ok(report.seoGoals.some((goal) => String(goal).includes("sales")));
});

test("business goal maps SaaS to demo/signup strategy", () => {
  const report = runSEOStrategy({ business: { websiteType: "saas", businessGoals: ["demo_booking"] } });
  assert.ok(report.seoGoals.some((goal) => /demo|signup/u.test(String(goal))));
});

test("business goal maps local to local visits/lead generation strategy", () => {
  const report = runSEOStrategy({ business: { websiteType: "local_business", businessGoals: ["local_visits"] } });
  assert.ok(report.seoGoals.some((goal) => /local/u.test(String(goal))));
});

test("P0 opportunities enter first30Days", () => {
  const report = runSEOStrategy({ websiteAudit: { criticalIssues: [{ title: "Important pages noindexed", priority: "P0" }] } });
  assert.ok(report.roadmap.first30Days.some((item) => JSON.stringify(item).includes("Important pages noindexed")));
});

test("P1 opportunities enter first30Days", () => {
  const report = runSEOStrategy({ websiteAudit: { issues: [{ title: "Missing H1", priority: "P1" }] } });
  assert.ok(report.roadmap.first30Days.length > 0);
});

test("BOFU opportunities are prioritized before TOFU", () => {
  const report = runSEOStrategy({ competitorAnalysis: { keywordGaps: [{ keyword: "what is seo", funnelStage: "tofu", priority: "P2" }, { keyword: "seo software pricing", funnelStage: "bofu", priority: "P2" }] } });
  assert.equal((report.priorityOpportunities[0] as { keyword: string }).keyword, "seo software pricing");
});

test("technical blockers are scheduled before content scaling", () => {
  const report = runSEOStrategy({ websiteAudit: { criticalIssues: [{ title: "Build failed", priority: "P0" }] }, contentPlan: { contentGaps: [{ title: "New blog cluster", priority: "P2" }] } });
  assert.ok(JSON.stringify(report.roadmap.first30Days).includes("Build failed"));
});

test("impact-effort matrix classifies high impact low effort as quick_win", () => {
  const report = runSEOStrategy({ websiteAudit: { quickWins: [{ title: "Fix title", priority: "P2", impact: "high", effort: "low" }] } });
  assert.ok(report.impactEffortMatrix.some((item) => (item as { classification: string }).classification === "quick_win"));
});

test("low impact high effort is deprioritized", () => {
  const report = runSEOStrategy({ websiteAudit: { strategicOpportunities: [{ title: "Optional rebuild", priority: "P3", impact: "low", effort: "high" }] } });
  assert.ok(report.impactEffortMatrix.some((item) => (item as { classification: string }).classification === "deprioritize"));
});

test("resource plan respects monthlyContentCapacity", () => {
  const report = runSEOStrategy({ resources: { monthlyContentCapacity: 1 }, contentPlan: { contentGaps: [{ title: "A" }, { title: "B" }] } });
  assert.ok(report.resourcePlan.some((item) => (item as { role: string; tasksThisMonth?: number }).role === "content" && (item as { tasksThisMonth: number }).tasksThisMonth === 1));
});

test("low capacity vs large roadmap creates risk", () => {
  const report = runSEOStrategy({ resources: { monthlyContentCapacity: 1 }, contentPlan: { contentGaps: [{ title: "A" }, { title: "B" }, { title: "C" }, { title: "D" }] } });
  assert.ok(report.risks.some((risk) => JSON.stringify(risk).includes("low-capacity-vs-roadmap")));
});

test("launch checklist without launch data returns needs_input", () => {
  assert.equal(runLaunchChecklist({}).status, "needs_input");
});

test("launch checklist flags missing analytics/Search Console", () => {
  const report = runLaunchChecklist({ launch: { isNewWebsite: true, hasAnalytics: false, hasSearchConsole: false, hasSitemap: true } });
  assert.ok(report.issues.some((issue) => issue.id === "launch-measurement-missing"));
});

test("migration plan without migration data returns needs_input", () => {
  assert.equal(runMigrationPlan({}).status, "needs_input");
});

test("migration plan flags missing redirect map", () => {
  const report = runMigrationPlan({ migration: { isMigration: true, migrationType: "url_structure" } });
  assert.ok(report.issues.some((issue) => issue.id === "migration-redirect-map-missing"));
});

test("migration plan rejects homepage-only redirect strategy when detectable", () => {
  const report = runMigrationPlan({ migration: { isMigration: true, redirectMap: [{ oldUrl: "/a", newUrl: "/" }, { oldUrl: "/b", newUrl: "/" }] } });
  assert.ok(report.issues.some((issue) => issue.id === "migration-homepage-only-redirect"));
});

test("strategy does not invent traffic/ranking/revenue metrics", () => {
  const report = runSEOStrategy({ business: { websiteType: "saas", businessGoals: ["demo_booking"] } });
  assert.doesNotMatch(JSON.stringify(report), /rankings improved|traffic forecast|revenue forecast|\b\d+ visits\b/u);
});

test("/seo-master help shows all Group 17 commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master seo-plan\s+\[active\]/u);
  assert.match(result.message, /\/seo-master seo-strategy\s+\[active\]/u);
  assert.match(result.message, /\/seo-master seo-campaign-plan\s+\[active\]/u);
  assert.match(result.message, /\/seo-master opportunity-plan\s+\[active\]/u);
  assert.match(result.message, /\/seo-master launch-checklist\s+\[active\]/u);
  assert.match(result.message, /\/seo-master migration-plan\s+\[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP strategy tools use same logic surface", () => {
  assert.ok(runSEOStrategy({ business: { websiteType: "saas", businessGoals: ["demo_booking"] } }).seoGoals.length > 0);
  assert.ok(runLaunchChecklist({ launch: { hasAnalytics: false } }).launchChecklist.length > 0);
});
