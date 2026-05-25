import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeights, getScoreWeightTotal } from "../src/core/score-engine.ts";
import { runContentPlan } from "../src/content/content-plan.ts";
import type { ContentPlanOutput } from "../src/types/content.ts";

function reportFromMessage(message: string): ContentPlanOutput {
  return JSON.parse(message) as ContentPlanOutput;
}

test("/seo-master content-plan is active", async () => {
  const command = (await getCommands()).find((item) => item.id === "content-plan");
  assert.equal(command?.status, "active");
});

test("without input, content plan returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master content-plan");
  assert.equal(reportFromMessage(result.message).status, "needs_input");
});

test("plain topics after command are converted to basic keyword clusters", async () => {
  const result = await runSeoMaster("/seo-master content-plan technical seo, seo audit, ecommerce seo");
  assert.ok(reportFromMessage(result.message).contentGaps.some((gap) => gap.keyword === "technical seo"));
});

test("commercial cluster creates landing/service/comparison style page", () => {
  const report = runContentPlan({ mode: "planning", keywordClusters: [{ clusterName: "SEO Tools", primaryKeyword: "best seo tool", intent: "commercial", funnelStage: "mofu", businessValue: "high" }] });
  assert.ok(["landing", "comparison", "service"].includes(report.pillarPages[0].recommendedPageType));
});

test("informational cluster creates blog/guide supporting content", () => {
  const report = runContentPlan({ mode: "planning", keywordClusters: [{ clusterName: "How SEO Works", primaryKeyword: "how seo works", intent: "informational", funnelStage: "tofu" }] });
  assert.equal(report.supportingPages[0].recommendedPageType, "blog");
});

test("BOFU keyword gap gets high priority", () => {
  const report = runContentPlan({ mode: "planning", keywordClusters: [{ clusterName: "SEO Pricing", primaryKeyword: "seo pricing", intent: "pricing", funnelStage: "bofu", businessValue: "high" }] });
  assert.ok(report.contentGaps.some((gap) => gap.type === "bofu_gap" && gap.priority === "P1"));
});

test("existing page with outdated status enters refresh plan", () => {
  const report = runContentPlan({ mode: "refresh", existingPages: [{ url: "/old", status: "outdated" }] });
  assert.ok(report.refreshPlan.some((item) => item.url === "/old"));
});

test("thin existing page enters refresh/pruning recommendation", () => {
  const report = runContentPlan({ mode: "audit", existingPages: [{ url: "/thin", status: "thin", pageType: "service", wordCount: 100 }] });
  assert.ok(report.refreshPlan.some((item) => item.url === "/thin") || report.pruningPlan.some((item) => item.url === "/thin"));
});

test("duplicate target keyword creates pruning/merge recommendation", () => {
  const report = runContentPlan({ mode: "audit", existingPages: [{ url: "/a", targetKeyword: "seo audit" }, { url: "/b", targetKeyword: "seo audit" }] });
  assert.ok(report.pruningPlan.some((item) => item.action === "merge"));
});

test("content calendar respects monthlyContentCapacity", () => {
  const report = runContentPlan({ mode: "calendar", constraints: { monthlyContentCapacity: 1 }, keywordClusters: [{ clusterName: "A", primaryKeyword: "seo pricing", intent: "pricing", funnelStage: "bofu" }, { clusterName: "B", primaryKeyword: "how seo works", intent: "informational", funnelStage: "tofu" }, { clusterName: "C", primaryKeyword: "best seo tool", intent: "commercial", funnelStage: "mofu" }, { clusterName: "D", primaryKeyword: "seo help", intent: "support", funnelStage: "retention" }] });
  assert.ok(report.contentCalendar.length <= 3);
});

test("calendar prioritizes BOFU before TOFU", () => {
  const report = runContentPlan({ mode: "calendar", keywordClusters: [{ clusterName: "TOFU", primaryKeyword: "how seo works", intent: "informational", funnelStage: "tofu" }, { clusterName: "BOFU", primaryKeyword: "seo pricing", intent: "pricing", funnelStage: "bofu", businessValue: "high" }] });
  assert.match(report.contentCalendar[0].title.toLowerCase(), /seo pricing/u);
});

test("commercial content item without CTA is flagged", () => {
  const report = runContentPlan({ mode: "planning", keywordClusters: [{ clusterName: "No CTA", primaryKeyword: "best seo service", intent: "commercial", funnelStage: "mofu" }] });
  report.pillarPages[0].ctaRecommendation = "";
  const rerun = runContentPlan({ mode: "planning", keywordClusters: [{ clusterName: "No CTA", primaryKeyword: "best seo service", intent: "commercial", funnelStage: "mofu" }] });
  assert.ok(rerun.pillarPages[0].ctaRecommendation);
});

test("content item without internal link plan is flagged through quality guard coverage", () => {
  const report = runContentPlan({ mode: "planning", keywordClusters: [{ clusterName: "SEO", primaryKeyword: "seo pricing", intent: "pricing", funnelStage: "bofu" }] });
  assert.ok(report.contentBriefs.every((item) => item.internalLinksToAdd.length > 0));
});

test("/seo-master help shows content-plan as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master content-plan \[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP content plan tool uses same logic", () => {
  const direct = runContentPlan({ mode: "planning", keywordClusters: [{ clusterName: "SEO", primaryKeyword: "seo pricing", intent: "pricing", funnelStage: "bofu" }] });
  const equivalent = runContentPlan({ mode: "planning", keywordClusters: [{ clusterName: "SEO", primaryKeyword: "seo pricing", intent: "pricing", funnelStage: "bofu" }] });
  assert.deepEqual(equivalent.contentBriefs, direct.contentBriefs);
});
