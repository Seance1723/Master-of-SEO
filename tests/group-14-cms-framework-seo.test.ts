import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runBuildSEOCheck } from "../src/cms-framework/build-seo-check.ts";
import { detectFramework, runFrameworkSEOAudit } from "../src/cms-framework/framework-seo-audit.ts";
import { runNextJSSEOAudit } from "../src/cms-framework/nextjs-seo-audit.ts";
import { runReactSEOAudit } from "../src/cms-framework/react-seo-audit.ts";
import { runStaticSEOAudit } from "../src/cms-framework/static-seo-audit.ts";
import { runWordPressSEOAudit } from "../src/cms-framework/wordpress-seo-audit.ts";

test("/seo-master framework-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "framework-seo-audit")?.status, "active");
});

test("/seo-master wordpress-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "wordpress-seo-audit")?.status, "active");
});

test("/seo-master react-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "react-seo-audit")?.status, "active");
});

test("/seo-master nextjs-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "nextjs-seo-audit")?.status, "active");
});

test("/seo-master static-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "static-seo-audit")?.status, "active");
});

test("/seo-master build-seo-check is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "build-seo-check")?.status, "active");
});

test("without input, framework audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master framework-seo-audit");
  assert.equal(result.type, "cms-framework-audit");
  assert.equal((result.data as ReturnType<typeof runFrameworkSEOAudit>).status, "needs_input");
});

test("packageJson with next dependency detects nextjs", () => {
  assert.equal(detectFramework({ packageJson: { dependencies: { next: "15.0.0", react: "19.0.0" } } }), "nextjs");
});

test("packageJson with react dependency detects react", () => {
  assert.equal(detectFramework({ packageJson: { dependencies: { react: "19.0.0" } } }), "react");
});

test("WordPress discourageSearchEngines true returns P0/P1 issue", () => {
  const report = runWordPressSEOAudit({ cms: { name: "wordpress", settings: { discourageSearchEngines: true, permalinkStructure: "/%postname%/" } } });
  assert.ok(report.issues.some((issue) => issue.id === "wordpress-discourage-search-engines" && ["P0", "P1"].includes(issue.priority)));
});

test("WordPress plain permalink returns issue", () => {
  const report = runWordPressSEOAudit({ cms: { name: "wordpress", settings: { permalinkStructure: "plain" } } });
  assert.ok(report.issues.some((issue) => issue.id === "wordpress-plain-permalink"));
});

test("WordPress attachmentPagesIndexable true returns issue", () => {
  const report = runWordPressSEOAudit({ cms: { name: "wordpress", settings: { permalinkStructure: "/%postname%/", attachmentPagesIndexable: true } } });
  assert.ok(report.issues.some((issue) => issue.id === "wordpress-attachment-pages-indexable"));
});

test("Multiple active SEO plugins returns issue", () => {
  const report = runWordPressSEOAudit({ cms: { name: "wordpress", settings: { permalinkStructure: "/%postname%/" }, plugins: [{ name: "Yoast", type: "seo", active: true }, { name: "Rank Math", type: "seo", active: true }] } });
  assert.ok(report.issues.some((issue) => issue.id === "wordpress-multiple-active-seo-plugins"));
});

test("React CSR public route returns issue", () => {
  const report = runReactSEOAudit({ routes: [{ path: "/services", rendering: "csr", title: "Services", metaDescription: "Services", canonicalUrl: "https://example.com/services", isIndexable: true }] });
  assert.ok(report.issues.some((issue) => issue.id === "react-csr-public-route"));
});

test("Empty root div HTML returns SPA SEO risk", () => {
  const report = runReactSEOAudit({ html: "<html><head><title>App</title></head><body><div id=\"root\"></div></body></html>" });
  assert.ok(report.issues.some((issue) => issue.id === "react-empty-root-div"));
});

test("Hash route returns issue", () => {
  const report = runReactSEOAudit({ routes: [{ path: "/#/services", rendering: "csr", title: "Services", metaDescription: "Services", canonicalUrl: "https://example.com/services", isIndexable: true }] });
  assert.ok(report.issues.some((issue) => issue.id === "react-hash-route"));
});

test("Next.js missing sitemap returns issue", () => {
  const report = runNextJSSEOAudit({ build: { status: "passed", generatedSitemap: false, generatedRobotsTxt: true } });
  assert.ok(report.issues.some((issue) => issue.id === "nextjs-missing-generated-sitemap"));
});

test("Next.js missing robots returns issue", () => {
  const report = runNextJSSEOAudit({ build: { status: "passed", generatedSitemap: true, generatedRobotsTxt: false } });
  assert.ok(report.issues.some((issue) => issue.id === "nextjs-missing-generated-robots"));
});

test("Dynamic route missing metadata returns issue", () => {
  const report = runNextJSSEOAudit({ routes: [{ path: "/blog/[slug]", title: "Blog" }] });
  assert.ok(report.issues.some((issue) => issue.id === "nextjs-dynamic-route-missing-metadata"));
});

test("Canonical with localhost/staging returns issue", () => {
  const report = runNextJSSEOAudit({ routes: [{ path: "/pricing", title: "Pricing", metaDescription: "Pricing", canonicalUrl: "http://localhost:3000/pricing" }] });
  assert.ok(report.issues.some((issue) => issue.id === "canonical-staging-localhost"));
});

test("Build failed returns P0 issue", () => {
  const report = runBuildSEOCheck({ build: { status: "failed", errors: ["metadata generation failed"] } });
  assert.ok(report.issues.some((issue) => issue.id === "framework-build-failed" && issue.priority === "P0"));
});

test("Build warnings related to metadata return issue", () => {
  const report = runBuildSEOCheck({ build: { status: "passed", warnings: ["metadata route warning"] } });
  assert.ok(report.issues.some((issue) => issue.id === "framework-build-seo-warning"));
});

test("Static HTML missing title/meta/canonical returns issues", () => {
  const report = runStaticSEOAudit({ html: "<html><body><main>Static page content</main></body></html>", seoFiles: { robotsTxt: "User-agent: *" } });
  assert.ok(report.issues.some((issue) => issue.id === "static-html-missing-title"));
  assert.ok(report.issues.some((issue) => issue.id === "static-html-missing-meta-description"));
  assert.ok(report.issues.some((issue) => issue.id === "static-html-missing-canonical"));
});

test("Private/dashboard route indexable returns issue", () => {
  const report = runFrameworkSEOAudit({ routes: [{ path: "/dashboard", title: "Dashboard", metaDescription: "Dashboard", canonicalUrl: "https://example.com/dashboard", isIndexable: true }] });
  assert.ok(report.issues.some((issue) => issue.id === "private-route-indexable"));
});

test("/seo-master help shows all Group 14 commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master framework-seo-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master wordpress-seo-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master react-seo-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master nextjs-seo-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master static-seo-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master build-seo-check\s+\[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP CMS/framework tools use same logic surface", () => {
  assert.ok(runWordPressSEOAudit({ cms: { name: "wordpress", settings: { discourageSearchEngines: true } } }).issues.some((issue) => issue.id === "wordpress-discourage-search-engines"));
  assert.ok(runNextJSSEOAudit({ build: { status: "failed" } }).issues.some((issue) => issue.id === "framework-build-failed"));
  assert.ok(runReactSEOAudit({ html: "<div id=\"root\"></div>" }).issues.some((issue) => issue.id === "react-empty-root-div"));
});
