import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runArchitectureAudit } from "../src/architecture/architecture-audit.ts";

test("/seo-master architecture-audit is active", async () => {
  const command = (await getCommands()).find((item) => item.id === "architecture-audit");
  assert.equal(command?.status, "active");
});

test("/seo-master internal-linking-audit is active", async () => {
  const command = (await getCommands()).find((item) => item.id === "internal-linking-audit");
  assert.equal(command?.status, "active");
});

test("without input, architecture audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master architecture-audit");
  assert.equal(result.type, "architecture-audit");
  assert.equal((result.data as ReturnType<typeof runArchitectureAudit>).status, "needs_input");
});

test("page with zero incoming links is flagged as orphan", () => {
  const report = runArchitectureAudit({ mode: "audit", pages: [{ url: "/", pageType: "homepage" }, { url: "/orphan", importance: "medium" }], links: [] });
  assert.ok(report.orphanPages.includes("/orphan"));
  assert.ok(report.issues.some((issue) => issue.id === "orphan-page"));
});

test("homepage is not flagged as orphan", () => {
  const report = runArchitectureAudit({ mode: "audit", pages: [{ url: "/", pageType: "homepage" }], links: [] });
  assert.equal(report.orphanPages.includes("/"), false);
});

test("critical orphan page returns P1", () => {
  const report = runArchitectureAudit({ mode: "audit", pages: [{ url: "/", pageType: "homepage" }, { url: "/services/seo", importance: "critical" }], links: [] });
  assert.ok(report.issues.some((issue) => issue.id === "orphan-page" && issue.priority === "P1"));
});

test("important page with too few incoming links returns issue", () => {
  const report = runArchitectureAudit({
    mode: "audit",
    pages: [{ url: "/", pageType: "homepage" }, { url: "/services/seo", importance: "high" }],
    links: [{ from: "/", to: "/services/seo", anchorText: "SEO services", linkType: "navigation" }]
  });
  assert.ok(report.issues.some((issue) => issue.id === "important-page-too-few-internal-links"));
});

test("BOFU/service page with no contextual incoming links returns issue", () => {
  const report = runArchitectureAudit({
    mode: "audit",
    pages: [{ url: "/", pageType: "homepage" }, { url: "/services/seo", pageType: "service", funnelStage: "bofu" }],
    links: [{ from: "/", to: "/services/seo", anchorText: "SEO services", linkType: "navigation" }]
  });
  assert.ok(report.issues.some((issue) => issue.id === "commercial-page-no-contextual-links"));
});

test("generic anchor text returns issue", () => {
  const report = runArchitectureAudit({ mode: "audit", links: [{ from: "/", to: "/services/seo", anchorText: "click here", linkType: "contextual" }] });
  assert.ok(report.anchorTextIssues.some((issue) => issue.id === "anchor-generic"));
});

test("javascript link returns issue", () => {
  const report = runArchitectureAudit({ mode: "audit", links: [{ from: "/", to: "javascript:void(0)", anchorText: "Services", linkType: "navigation" }] });
  assert.ok(report.anchorTextIssues.some((issue) => issue.id === "internal-javascript-link"));
});

test("nofollow internal link returns issue", () => {
  const report = runArchitectureAudit({ mode: "audit", links: [{ from: "/", to: "/pricing", anchorText: "Pricing", linkType: "contextual", isFollowed: false }] });
  assert.ok(report.issues.some((issue) => issue.id === "nofollow-internal-link"));
});

test("missing breadcrumbs on product/category page returns issue", () => {
  const report = runArchitectureAudit({ mode: "audit", pages: [{ url: "/", pageType: "homepage" }, { url: "/products/widget", pageType: "product" }], links: [] });
  assert.ok(report.breadcrumbIssues.some((issue) => issue.id === "breadcrumbs-missing"));
});

test("topic cluster supporting page not linking to pillar returns issue", () => {
  const report = runArchitectureAudit({
    mode: "audit",
    topicClusters: [{ clusterName: "Technical SEO", pillarUrl: "/technical-seo", supportingUrls: ["/technical-seo-audit"] }],
    links: []
  });
  assert.ok(report.topicClusterLinkingIssues.some((issue) => issue.id === "support-not-linking-pillar"));
});

test("crawl depth greater than 3 for critical page returns issue", () => {
  const report = runArchitectureAudit({
    mode: "audit",
    pages: [
      { url: "/", pageType: "homepage" },
      { url: "/a" },
      { url: "/b" },
      { url: "/c" },
      { url: "/target", importance: "critical" }
    ],
    links: [
      { from: "/", to: "/a", anchorText: "A", linkType: "contextual" },
      { from: "/a", to: "/b", anchorText: "B", linkType: "contextual" },
      { from: "/b", to: "/c", anchorText: "C", linkType: "contextual" },
      { from: "/c", to: "/target", anchorText: "Target", linkType: "contextual" }
    ]
  });
  assert.ok(report.crawlDepthIssues.some((issue) => issue.id === "critical-page-too-deep"));
});

test("/seo-master help shows architecture commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master architecture-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master internal-linking-audit\s+\[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP architecture audit tool uses same logic surface", () => {
  const direct = runArchitectureAudit({ mode: "audit", links: [{ from: "/", to: "/pricing", anchorText: "click here" }] });
  const mcpEquivalent = runArchitectureAudit({ mode: "audit", links: [{ from: "/", to: "/pricing", anchorText: "click here" }] });
  assert.deepEqual(mcpEquivalent.issues, direct.issues);
});
