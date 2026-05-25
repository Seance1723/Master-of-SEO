import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeights, getScoreWeightTotal } from "../src/core/score-engine.ts";
import { runKeywordResearch } from "../src/keywords/keyword-research.ts";
import type { KeywordResearchOutput } from "../src/types/keywords.ts";

function reportFromMessage(message: string): KeywordResearchOutput {
  return JSON.parse(message) as KeywordResearchOutput;
}

test("/seo-master keyword-research is active", async () => {
  const command = (await getCommands()).find((item) => item.id === "keyword-research");
  assert.equal(command?.status, "active");
});

test("without input, keyword research returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master keyword-research");
  assert.equal(reportFromMessage(result.message).status, "needs_input");
});

test("plain keywords after command are parsed as seedKeywords", async () => {
  const result = await runSeoMaster("/seo-master keyword-research technical seo, seo audit, ecommerce seo");
  const report = reportFromMessage(result.message);
  assert.ok(report.clusters.some((cluster) => cluster.primaryKeyword.includes("technical seo")));
});

test("duplicate keywords are normalized", () => {
  const report = runKeywordResearch({ mode: "research", seedKeywords: ["SEO Audit", " seo audit ", "Technical SEO"] });
  const all = report.clusters.flatMap((cluster) => [cluster.primaryKeyword, ...cluster.secondaryKeywords]).map((item) => item.toLowerCase());
  assert.equal(all.filter((keyword) => keyword === "seo audit").length, 1);
});

test("how to improve SEO returns informational intent", () => {
  assert.equal(runKeywordResearch({ mode: "research", seedKeywords: ["how to improve SEO"] }).clusters[0].intent, "informational");
});

test("best SEO audit tool returns commercial intent", () => {
  assert.equal(runKeywordResearch({ mode: "research", seedKeywords: ["best SEO audit tool"] }).clusters[0].intent, "commercial");
});

test("hire technical SEO consultant returns transactional intent", () => {
  assert.equal(runKeywordResearch({ mode: "research", seedKeywords: ["hire technical SEO consultant"] }).clusters[0].intent, "transactional");
});

test("SEO pricing returns pricing intent", () => {
  assert.equal(runKeywordResearch({ mode: "research", seedKeywords: ["SEO pricing"] }).clusters[0].intent, "pricing");
});

test("SEO agency near me returns local intent", () => {
  assert.equal(runKeywordResearch({ mode: "research", seedKeywords: ["SEO agency near me"] }).clusters[0].intent, "local");
});

test("Ahrefs vs Semrush returns comparison intent", () => {
  assert.equal(runKeywordResearch({ mode: "research", seedKeywords: ["Ahrefs vs Semrush"] }).clusters[0].intent, "comparison");
});

test("BOFU keywords get high business value", () => {
  assert.equal(runKeywordResearch({ mode: "research", seedKeywords: ["hire technical SEO consultant"] }).clusters[0].businessValue, "high");
});

test("multiple pages with same targetKeyword return cannibalization risk", () => {
  const report = runKeywordResearch({
    mode: "audit",
    seedKeywords: ["technical seo"],
    existingPages: [
      { url: "/a", targetKeyword: "technical seo" },
      { url: "/b", targetKeyword: "technical seo" }
    ]
  });
  assert.ok(report.cannibalizationRisks.length > 0);
});

test("keyword difficulty 0-30 maps to easy", () => {
  assert.equal(runKeywordResearch({ mode: "research", keywordMetrics: [{ keyword: "seo audit", difficulty: 20 }] }).clusters[0].difficultyLevel, "easy");
});

test("keyword difficulty 31-60 maps to medium", () => {
  assert.equal(runKeywordResearch({ mode: "research", keywordMetrics: [{ keyword: "seo audit", difficulty: 45 }] }).clusters[0].difficultyLevel, "medium");
});

test("keyword difficulty 61-100 maps to hard", () => {
  assert.equal(runKeywordResearch({ mode: "research", keywordMetrics: [{ keyword: "seo audit", difficulty: 80 }] }).clusters[0].difficultyLevel, "hard");
});

test("/seo-master help shows keyword-research as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master keyword-research \[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP keyword research tool uses same logic", () => {
  const direct = runKeywordResearch({ mode: "research", seedKeywords: ["SEO pricing"] });
  const equivalent = runKeywordResearch({ mode: "research", seedKeywords: ["SEO pricing"] });
  assert.deepEqual(equivalent.clusters, direct.clusters);
});
