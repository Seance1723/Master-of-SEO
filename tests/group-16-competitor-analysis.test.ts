import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runCompetitorAnalysis } from "../src/competitors/competitor-analysis.ts";
import { runCompetitorBacklinkGap } from "../src/competitors/competitor-backlink-gap.ts";
import { runCompetitorKeywordGap } from "../src/competitors/competitor-keyword-gap.ts";
import { runCompetitorSerpAnalysis } from "../src/competitors/competitor-serp-analysis.ts";

for (const id of ["competitor-analysis", "competitor-audit", "competitor-keyword-gap", "competitor-content-gap", "competitor-backlink-gap", "serp-analysis"]) {
  test(`/seo-master ${id} is active`, async () => {
    assert.equal((await getCommands()).find((command) => command.id === id)?.status, "active");
  });
}

test("without input, competitor analysis returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master competitor-analysis");
  assert.equal(result.type, "competitor-analysis");
  assert.equal((result.data as ReturnType<typeof runCompetitorAnalysis>).status, "needs_input");
});

test("only competitor URLs return limited needs_input without live crawl", async () => {
  const result = await runSeoMaster("/seo-master competitor-analysis https://competitor.com");
  const report = result.data as ReturnType<typeof runCompetitorAnalysis>;
  assert.equal(report.status, "needs_input");
  assert.match(report.summary, /Competitor URLs alone/u);
});

test("direct competitor type is preserved when provided", () => {
  const report = runCompetitorAnalysis({ competitors: [{ domain: "a.com", type: "direct" }] });
  assert.equal((report.competitorTypes[0] as { type: string }).type, "direct");
});

test("search competitor is inferred from SERP data", () => {
  const report = runCompetitorAnalysis({ competitors: [{ domain: "a.com", pages: [{ url: "https://a.com/service", pageType: "service" }] }], serpData: [{ keyword: "seo", topResults: [{ url: "https://a.com/service", domain: "a.com", pageType: "service" }] }] });
  assert.equal((report.competitorTypes[0] as { type: string }).type, "search");
});

test("content competitor is inferred from mostly blog/article pages", () => {
  const report = runCompetitorAnalysis({ competitors: [{ domain: "blog.com", pages: [{ url: "/a", pageType: "blog" }, { url: "/b", pageType: "article" }] }] });
  assert.equal((report.competitorTypes[0] as { type: string }).type, "content");
});

test("keyword gaps are detected from competitor keywords missing in own site", () => {
  const report = runCompetitorKeywordGap({ ownSite: { pages: [{ url: "/seo", rankingKeywords: ["seo services"] }] }, competitors: [{ domain: "a.com", keywords: [{ keyword: "technical seo services", intent: "transactional" }] }] });
  assert.ok(report.keywordGaps.some((gap) => (gap as { keyword: string }).keyword === "technical seo services"));
});

test("BOFU keyword gaps get higher priority", () => {
  const report = runCompetitorKeywordGap({ ownSite: { pages: [{ url: "/seo", rankingKeywords: ["seo services"] }] }, competitors: [{ domain: "a.com", keywords: [{ keyword: "technical seo services", rank: 4, intent: "transactional" }] }] });
  assert.ok(report.keywordGaps.some((gap) => (gap as { priority: string }).priority === "P1"));
  assert.ok(report.issues.some((issue) => issue.id === "competitor-keyword-gap" && issue.priority === "P1"));
});

test("content gap is detected when competitor targetKeyword has no own page", () => {
  const report = runCompetitorAnalysis({ ownSite: { pages: [{ url: "/seo", targetKeyword: "seo services" }] }, competitors: [{ domain: "a.com", pages: [{ url: "/technical-seo", pageType: "service", targetKeyword: "technical seo services" }] }] });
  assert.ok(report.contentGaps.some((gap) => (gap as { keyword: string }).keyword === "technical seo services"));
});

test("backlink gap ignores spam links", () => {
  const report = runCompetitorBacklinkGap({ competitors: [{ domain: "a.com", backlinks: [{ sourceUrl: "https://spam.example", isSpam: true }, { sourceUrl: "https://resource.example", linkType: "resource" }] }] });
  assert.equal(report.backlinkGaps.some((gap) => (gap as { sourceUrl: string }).sourceUrl === "https://spam.example"), false);
});

test("backlink gap prioritizes editorial/partner/resource links", () => {
  const report = runCompetitorBacklinkGap({ competitors: [{ domain: "a.com", backlinks: [{ sourceUrl: "https://resource.example", linkType: "resource" }] }] });
  assert.ok(report.backlinkGaps.some((gap) => (gap as { priority: string }).priority === "P2"));
});

test("SERP dominant page type is detected from provided topResults", () => {
  const report = runCompetitorSerpAnalysis({ serpData: [{ keyword: "technical seo", topResults: [{ url: "https://a.com/guide", pageType: "blog" }, { url: "https://b.com/post", pageType: "blog" }, { url: "https://c.com/service", pageType: "service" }] }] });
  assert.equal((report.serpFindings[0] as { dominantPageType: string }).dominantPageType, "blog");
});

test("SERP feature opportunities are generated from provided features", () => {
  const report = runCompetitorSerpAnalysis({ serpData: [{ keyword: "technical seo", features: ["people_also_ask", "featured_snippet"] }] });
  assert.ok(report.serpFeatureOpportunities.some((item) => (item as { feature: string }).feature === "people_also_ask"));
});

test("schema recommendation does not add fake review/rating schema", () => {
  const report = runCompetitorAnalysis({ ownSite: { pages: [{ url: "/p", schemaTypes: [] }] }, competitors: [{ domain: "a.com", pages: [{ url: "/p", schemaTypes: ["Product", "Review", "AggregateRating"] }] }] });
  const schemas = report.schemaFindings.map((item) => (item as { schemaType: string }).schemaType);
  assert.ok(schemas.includes("Product"));
  assert.ok(!schemas.includes("Review"));
  assert.ok(!schemas.includes("AggregateRating"));
});

test("metadata recommendation does not copy competitor title", () => {
  const report = runCompetitorAnalysis({ ownSite: { pages: [{ url: "/seo" }] }, competitors: [{ domain: "a.com", pages: [{ url: "/seo", title: "Best SEO Agency Ever" }] }] });
  assert.match(JSON.stringify(report.metadataFindings), /do not copy competitor titles/u);
});

test("UX/conversion gap detects missing CTA when competitors have CTA", () => {
  const report = runCompetitorAnalysis({ business: { goals: ["lead_generation"] }, ownSite: { pages: [{ url: "/services" }] }, competitors: [{ domain: "a.com", pages: [{ url: "/services", ctaText: "Book a demo" }] }] });
  assert.ok(report.uxConversionFindings.length > 0);
  assert.ok(report.issues.some((issue) => issue.id === "competitor-ux-conversion-gap"));
});

test("/seo-master help shows all Group 16 commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master competitor-analysis\s+\[active\]/u);
  assert.match(result.message, /\/seo-master competitor-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master competitor-keyword-gap\s+\[active\]/u);
  assert.match(result.message, /\/seo-master competitor-content-gap\s+\[active\]/u);
  assert.match(result.message, /\/seo-master competitor-backlink-gap\s+\[active\]/u);
  assert.match(result.message, /\/seo-master serp-analysis\s+\[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP competitor tools use same logic surface", () => {
  assert.ok(runCompetitorAnalysis({ competitors: [{ domain: "a.com", keywords: [{ keyword: "seo pricing", intent: "pricing" }] }] }).keywordGaps.length > 0);
  assert.ok(runCompetitorBacklinkGap({ competitors: [{ domain: "a.com", backlinks: [{ sourceUrl: "https://resource.example", linkType: "resource" }] }] }).backlinkGaps.length > 0);
});
