import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { auditCategoryWeights, calculateWebsiteScore, gradeFromScore } from "../src/website-audit/website-score.ts";
import { runWebsiteAudit } from "../src/website-audit/website-audit.ts";

test("/seo-master audit-website is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "audit-website")?.status, "active");
});

test("/seo-master website-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "website-audit")?.status, "active");
});

test("/seo-master full-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "full-audit")?.status, "active");
});

test("/seo-master page-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "page-audit")?.status, "active");
});

test("without input, website audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master audit-website");
  assert.equal(result.type, "website-audit");
  assert.equal((result.data as ReturnType<typeof runWebsiteAudit>).status, "needs_input");
});

test("only URL input returns limited needs_input without live crawl", async () => {
  const result = await runSeoMaster("/seo-master audit-website https://example.com");
  const report = result.data as ReturnType<typeof runWebsiteAudit>;
  assert.equal(report.status, "needs_input");
  assert.match(report.nextActions.join(" "), /No live crawling/u);
});

test("website type is inferred from ecommerce inputs", () => {
  const report = runWebsiteAudit({ ecommerce: { products: [{ url: "/p/shoe", name: "Shoe" }] } });
  assert.equal(report.websiteType, "ecommerce");
});

test("website type is inferred from local inputs", () => {
  const report = runWebsiteAudit({ localInternational: { business: { name: "ABC Dental" } } });
  assert.equal(report.websiteType, "local_business");
});

test("business goal is inferred from ecommerce/SaaS/local/blog inputs", () => {
  assert.equal(runWebsiteAudit({ ecommerce: { products: [{ url: "/p/shoe" }] } }).businessGoal, "sales");
  assert.equal(runWebsiteAudit({ pages: [{ url: "/pricing", pageType: "pricing" }] }).businessGoal, "demo_booking");
  assert.equal(runWebsiteAudit({ localInternational: { business: { name: "ABC Dental" } } }).businessGoal, "local_visits");
  assert.equal(runWebsiteAudit({ pages: [{ url: "/blog/a", pageType: "blog" }] }).businessGoal, "content_traffic");
});

test("aggregator runs only modules with available input", () => {
  const report = runWebsiteAudit({ performance: { metrics: { lcp: 4.2 } } });
  assert.ok(report.categoryFindings.some((finding) => finding.startsWith("performance-seo")));
  assert.ok(!report.categoryFindings.some((finding) => finding.startsWith("ecommerce-seo")));
});

test("ecommerce category is skipped when not applicable", () => {
  const report = runWebsiteAudit({ pages: [{ url: "/", pageType: "homepage", title: "Home", h1: "Home" }] });
  assert.equal(report.categoryScores.ecommerceSeo, null);
});

test("local/international category is skipped when not applicable", () => {
  const report = runWebsiteAudit({ pages: [{ url: "/", pageType: "homepage", title: "Home", h1: "Home" }] });
  assert.equal(report.categoryScores.localInternationalSeo, null);
});

test("issues are deduplicated", () => {
  const report = runWebsiteAudit({ pages: [{ url: "/a", pageType: "service" }, { url: "/a", pageType: "service" }] });
  const missingTitle = report.issues.filter((issue) => issue.id === "page-missing-title");
  assert.equal(missingTitle.length, 1);
});

test("repeated page issues become template findings", () => {
  const report = runWebsiteAudit({ pages: [{ url: "/s1", pageType: "service" }, { url: "/s2", pageType: "service" }] });
  assert.ok(report.templateFindings.some((finding) => finding.includes("service")));
  assert.ok(report.issues.some((issue) => issue.id === "template-missing-title"));
});

test("P0 issues reduce score strongly", () => {
  const report = runWebsiteAudit({ cmsFramework: { build: { status: "failed" } } });
  assert.ok(report.issues.some((issue) => issue.priority === "P0"));
  assert.ok(report.score < 90);
});

test("non-applicable categories are excluded from score normalization", () => {
  const base = runWebsiteAudit({ pages: [{ url: "/", title: "Home", h1: "Home" }] });
  assert.equal(base.categoryScores.ecommerceSeo, null);
  assert.equal(base.categoryScores.localInternationalSeo, null);
  assert.equal(typeof base.score, "number");
});

test("grade A/B/C/D/F mapping works", () => {
  assert.equal(gradeFromScore(95), "A");
  assert.equal(gradeFromScore(80), "B");
  assert.equal(gradeFromScore(65), "C");
  assert.equal(gradeFromScore(45), "D");
  assert.equal(gradeFromScore(20), "F");
});

test("roadmap puts P0 in first7Days", () => {
  const report = runWebsiteAudit({ cmsFramework: { build: { status: "failed" } } });
  assert.ok(report.roadmap.first7Days.some((item) => item.includes("Fix")));
});

test("roadmap puts P1 in first30Days", () => {
  const report = runWebsiteAudit({ pages: [{ url: "/services", pageType: "service" }] });
  assert.ok(report.roadmap.first30Days.some((item) => item.includes("Fix")));
});

test("quick wins include missing title/meta/H1 where provided", () => {
  const report = runWebsiteAudit({ pages: [{ url: "/services", pageType: "service" }] });
  assert.ok(report.quickWins.some((item) => /Missing title|Missing meta|Missing H1/u.test(item)));
});

test("strategic opportunities include content and cluster gaps where provided", () => {
  const report = runWebsiteAudit({ content: { keywordClusters: [{ clusterName: "SEO Services", primaryKeyword: "seo services", funnelStage: "bofu", businessValue: "high" }] } });
  assert.ok(report.strategicOpportunities.length > 0);
});

test("/seo-master help shows Group 15 commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master audit-website\s+\[active\]/u);
  assert.match(result.message, /\/seo-master website-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master full-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master page-audit\s+\[active\]/u);
});

test("score weights total 100 after normalization where applicable", () => {
  assert.equal(Object.values(auditCategoryWeights).reduce((sum, weight) => sum + weight, 0), 100);
  assert.equal(calculateWebsiteScore({ technicalSeo: 100, performanceSeo: 100, onPageSeo: 100, contentSeo: 100, architectureInternalLinking: 100, schemaEntitySeo: 100, mediaSeo: 100, ecommerceSeo: null, localInternationalSeo: null, aiSearchDiscoverSeo: 100, trustSecurityAccessibility: 100, cmsFrameworkSeo: 100 }), 100);
});

test("MCP website audit tools use same logic surface", () => {
  assert.equal(runWebsiteAudit({ cmsFramework: { build: { status: "failed" } } }).issues.some((issue) => issue.id === "framework-build-failed"), true);
});
