import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runAIContentQualityAudit } from "../src/ai-discover/ai-generated-content-quality-guard.ts";
import { runAISearchAudit } from "../src/ai-discover/ai-search-audit.ts";
import { runAnswerBlockAudit } from "../src/ai-discover/answer-block.ts";
import { runDiscoverSEOAudit } from "../src/ai-discover/discover-seo-audit.ts";

test("/seo-master ai-search-readiness is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "ai-search-readiness")?.status, "active");
});

test("/seo-master ai-search-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "ai-search-audit")?.status, "active");
});

test("/seo-master answer-block-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "answer-block-audit")?.status, "active");
});

test("/seo-master discover-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "discover-seo-audit")?.status, "active");
});

test("/seo-master ai-content-quality-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "ai-content-quality-audit")?.status, "active");
});

test("without input, AI search audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master ai-search-readiness");
  assert.equal(result.type, "ai-discover-audit");
  assert.equal((result.data as ReturnType<typeof runAISearchAudit>).status, "needs_input");
});

test("without input, Discover audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master discover-seo-audit");
  assert.equal(result.type, "ai-discover-audit");
  assert.equal((result.data as ReturnType<typeof runDiscoverSEOAudit>).status, "needs_input");
});

test("noindex page returns AI visibility issue", () => {
  const report = runAISearchAudit({ mode: "audit", page: { url: "/guide", isIndexable: false } });
  assert.ok(report.issues.some((issue) => issue.id === "ai-page-not-indexable"));
});

test("nosnippet page returns snippet eligibility issue", () => {
  const report = runAISearchAudit({ mode: "audit", page: { robots: "index,nosnippet" } });
  assert.ok(report.issues.some((issue) => issue.id === "ai-page-nosnippet"));
});

test("low maxSnippet returns issue", () => {
  const report = runAISearchAudit({ mode: "audit", page: { maxSnippet: 20 } });
  assert.ok(report.issues.some((issue) => issue.id === "ai-max-snippet-too-low"));
});

test("missing answer block for informational query returns recommendation", () => {
  const report = runAnswerBlockAudit({ mode: "answer_block", queries: [{ query: "what is technical seo", intent: "informational" }], content: { sections: [{ heading: "Technical SEO", text: "Technical SEO helps crawling.", type: "definition" }] } });
  assert.ok(report.issues.some((issue) => issue.id === "missing-answer-block"));
});

test("vague answer block returns issue", () => {
  const report = runAnswerBlockAudit({ mode: "answer_block", content: { answerBlocks: [{ question: "What is SEO?", answer: "It depends." }] } });
  assert.ok(report.issues.some((issue) => issue.id === "answer-block-too-vague"));
});

test("long page with no headings returns issue", () => {
  const bodyText = Array.from({ length: 520 }, () => "content").join(" ");
  const report = runAISearchAudit({ mode: "audit", page: { title: "Guide", bodyText } });
  assert.ok(report.issues.some((issue) => issue.id === "long-page-with-no-headings"));
});

test("query not covered by headings/FAQs returns issue", () => {
  const report = runAISearchAudit({ mode: "audit", queries: [{ query: "technical seo pricing", intent: "pricing" }], content: { sections: [{ heading: "Implementation", text: "Setup steps." }] } });
  assert.ok(report.issues.some((issue) => issue.id === "query-not-covered"));
});

test("invalid sameAs returns issue", () => {
  const report = runAISearchAudit({ mode: "audit", entities: [{ name: "Example", type: "organization", sameAs: ["not-a-url"] }] });
  assert.ok(report.issues.some((issue) => issue.id === "entity-invalid-sameas"));
});

test("no original insights/examples/sources returns information gain issue", () => {
  const report = runAISearchAudit({ mode: "audit", queries: [{ query: "best seo audit tool", intent: "commercial" }], content: { summary: "A useful comparison." } });
  assert.ok(report.issues.some((issue) => issue.id === "missing-information-gain"));
});

test("factual content with no sources returns citation quality issue", () => {
  const report = runAISearchAudit({ mode: "audit", page: { bodyText: "This 2026 research statistic affects financial security decisions." }, content: { summary: "Research statistic." } });
  assert.ok(report.issues.some((issue) => issue.id === "factual-content-without-sources"));
});

test("generic content with no proof/examples returns AI content quality issue", () => {
  const report = runAIContentQualityAudit({ mode: "content_quality", content: { summary: "In today's digital landscape, our comprehensive solution can boost your online presence." } });
  assert.ok(report.issues.some((issue) => issue.id === "generic-ai-content-quality-risk"));
});

test("Discover page not indexable returns issue", () => {
  const report = runDiscoverSEOAudit({ mode: "discover", page: { pageType: "article", title: "SEO Trends", isIndexable: false } });
  assert.ok(report.issues.some((issue) => issue.id === "discover-page-not-indexable"));
});

test("Discover page maxImagePreview not large returns recommendation", () => {
  const report = runDiscoverSEOAudit({ mode: "discover", page: { pageType: "article", title: "SEO Trends", isIndexable: true, maxImagePreview: "standard" } });
  assert.ok(report.issues.some((issue) => issue.id === "discover-max-image-preview-not-large"));
});

test("Discover article missing OG/hero image returns issue", () => {
  const report = runDiscoverSEOAudit({ mode: "discover", page: { pageType: "article", title: "SEO Trends", isIndexable: true } });
  assert.ok(report.issues.some((issue) => issue.id === "discover-missing-og-hero-image"));
});

test("Discover article missing publisher/author/date returns issue", () => {
  const report = runDiscoverSEOAudit({ mode: "discover", page: { pageType: "article", title: "SEO Trends", isIndexable: true }, publisher: {} });
  assert.ok(report.issues.some((issue) => issue.id === "discover-missing-publisher-name"));
  assert.ok(report.issues.some((issue) => issue.id === "discover-missing-author"));
  assert.ok(report.issues.some((issue) => issue.id === "discover-missing-publish-date"));
});

test("clickbait/misleading title risk flag returns issue", () => {
  const report = runDiscoverSEOAudit({ mode: "discover", page: { title: "You Won't Believe These SEO Secrets" }, contentSignals: { hasClickbaitRisk: true, hasMisleadingTitleRisk: true } });
  assert.ok(report.issues.some((issue) => issue.id === "discover-clickbait-risk"));
  assert.ok(report.issues.some((issue) => issue.id === "discover-misleading-title-risk"));
});

test("shocking thumbnail risk flag returns issue", () => {
  const report = runDiscoverSEOAudit({ mode: "discover", openGraph: { ogImage: "/thumb.jpg" }, contentSignals: { hasShockingThumbnailRisk: true } });
  assert.ok(report.issues.some((issue) => issue.id === "discover-shocking-thumbnail-risk"));
});

test("/seo-master help shows all Group 12 commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master ai-search-readiness\s+\[active\]/u);
  assert.match(result.message, /\/seo-master ai-search-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master answer-block-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master discover-seo-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master ai-content-quality-audit\s+\[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP AI/Discover tools use same logic surface", () => {
  const ai = runAISearchAudit({ mode: "audit", page: { isIndexable: false } });
  const answer = runAnswerBlockAudit({ mode: "answer_block", content: { answerBlocks: [{ answer: "It depends." }] } });
  const discover = runDiscoverSEOAudit({ mode: "discover", page: { isIndexable: false } });
  const quality = runAIContentQualityAudit({ mode: "content_quality", content: { summary: "In today's digital landscape, this comprehensive solution is a game changer." } });
  assert.ok(ai.issues.some((issue) => issue.id === "ai-page-not-indexable"));
  assert.ok(answer.issues.some((issue) => issue.id === "answer-block-too-vague"));
  assert.ok(discover.issues.some((issue) => issue.id === "discover-page-not-indexable"));
  assert.ok(quality.issues.some((issue) => issue.id === "generic-ai-content-quality-risk"));
});
