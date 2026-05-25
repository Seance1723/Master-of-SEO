import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runSchemaAudit } from "../src/schema/schema-audit.ts";
import { runSchemaGenerate } from "../src/schema/schema-generate.ts";

test("/seo-master schema-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "schema-audit")?.status, "active");
});

test("/seo-master schema-generate is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "schema-generate")?.status, "active");
});

test("without input, schema audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master schema-audit");
  assert.equal(result.type, "schema-audit");
  assert.equal((result.data as ReturnType<typeof runSchemaAudit>).status, "needs_input");
});

test("HTML JSON-LD extraction works", () => {
  const report = runSchemaAudit({ mode: "audit", html: '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Example"}</script>' });
  assert.ok(report.detectedSchemas.includes("Organization"));
});

test("invalid JSON-LD returns issue", () => {
  const report = runSchemaAudit({ mode: "audit", html: '<script type="application/ld+json">{"@type":</script>' });
  assert.ok(report.issues.some((issue) => issue.id === "invalid-json-ld"));
});

test("missing @context returns issue", () => {
  const report = runSchemaAudit({ mode: "audit", jsonLd: [{ "@type": "Organization", name: "Example" }] });
  assert.ok(report.issues.some((issue) => issue.id === "schema-missing-context"));
});

test("missing @type returns issue", () => {
  const report = runSchemaAudit({ mode: "audit", jsonLd: [{ "@context": "https://schema.org", name: "Example" }] });
  assert.ok(report.issues.some((issue) => issue.id === "schema-missing-type"));
});

test("homepage recommends Organization + WebSite", () => {
  const report = runSchemaAudit({ mode: "audit", page: { pageType: "homepage", url: "https://example.com" } });
  assert.ok(report.recommendedSchemas.includes("Organization"));
  assert.ok(report.recommendedSchemas.includes("WebSite"));
});

test("service page recommends Service schema", () => {
  const report = runSchemaAudit({ mode: "audit", page: { pageType: "service" } });
  assert.ok(report.recommendedSchemas.includes("Service"));
});

test("product page recommends Product schema", () => {
  const report = runSchemaAudit({ mode: "audit", page: { pageType: "product" } });
  assert.ok(report.recommendedSchemas.includes("Product"));
});

test("software page recommends SoftwareApplication schema", () => {
  const report = runSchemaAudit({ mode: "audit", softwareApplication: { name: "App" } });
  assert.ok(report.recommendedSchemas.includes("SoftwareApplication"));
});

test("BreadcrumbList missing itemListElement returns issue", () => {
  const report = runSchemaAudit({ mode: "audit", jsonLd: [{ "@context": "https://schema.org", "@type": "BreadcrumbList" }] });
  assert.ok(report.issues.some((issue) => issue.id === "breadcrumb-missing-item-list"));
});

test("Product aggregateRating without visible review evidence returns issue", () => {
  const report = runSchemaAudit({ mode: "audit", jsonLd: [{ "@context": "https://schema.org", "@type": "Product", name: "Widget", aggregateRating: { ratingValue: 5 } }] });
  assert.ok(report.issues.some((issue) => issue.id === "product-rating-without-visible-evidence"));
});

test("Organization name mismatch returns issue", () => {
  const report = runSchemaAudit({ mode: "audit", organization: { name: "Real Brand" }, jsonLd: [{ "@context": "https://schema.org", "@type": "Organization", name: "Other Brand" }] });
  assert.ok(report.issues.some((issue) => issue.id === "organization-name-mismatch"));
});

test("sameAs non-URL returns issue", () => {
  const report = runSchemaAudit({ mode: "audit", organization: { name: "Example", sameAs: ["not-a-url"] } });
  assert.ok(report.issues.some((issue) => issue.id === "sameas-non-url"));
});

test("schema generation does not invent missing fields", () => {
  const report = runSchemaGenerate({ mode: "generate", organization: { name: "Example" } });
  const org = report.generatedJsonLd.find((item) => item["@type"] === "Organization");
  assert.equal(org?.name, "Example");
  assert.equal("url" in (org ?? {}), false);
});

test("FAQPage schema is not generated without visible FAQ input", () => {
  const report = runSchemaGenerate({ mode: "generate", page: { pageType: "homepage", visibleContent: "Welcome" } });
  assert.equal(report.generatedJsonLd.some((item) => item["@type"] === "FAQPage"), false);
});

test("/seo-master help shows schema-audit and schema-generate as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master schema-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master schema-generate\s+\[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP schema audit and generate tools use same logic surface", () => {
  const audit = runSchemaAudit({ mode: "audit", jsonLd: [{ "@type": "Organization" }] });
  const generate = runSchemaGenerate({ mode: "generate", organization: { name: "Example" } });
  assert.ok(audit.issues.some((issue) => issue.id === "schema-missing-context"));
  assert.ok(generate.generatedJsonLd.some((item) => item["@type"] === "Organization"));
});
