import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runHreflangAudit, runInternationalSEOAudit } from "../src/local-international/international-seo-audit.ts";
import { runLocalSEOAudit } from "../src/local-international/local-seo-audit.ts";

test("/seo-master local-seo is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "local-seo")?.status, "active");
});

test("/seo-master local-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "local-seo-audit")?.status, "active");
});

test("/seo-master international-seo is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "international-seo")?.status, "active");
});

test("/seo-master international-seo-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "international-seo-audit")?.status, "active");
});

test("/seo-master hreflang-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "hreflang-audit")?.status, "active");
});

test("without input, local audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master local-seo");
  assert.equal(result.type, "local-international-audit");
  assert.equal((result.data as ReturnType<typeof runLocalSEOAudit>).status, "needs_input");
});

test("without input, international audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master international-seo");
  assert.equal(result.type, "local-international-audit");
  assert.equal((result.data as ReturnType<typeof runInternationalSEOAudit>).status, "needs_input");
});

test("local business missing phone returns issue", () => {
  const report = runLocalSEOAudit({ mode: "audit", business: { name: "ABC Dental", businessType: "local_business", address: { city: "Bangalore" } } });
  assert.ok(report.issues.some((issue) => issue.id === "local-business-missing-phone"));
});

test("local business missing address returns issue", () => {
  const report = runLocalSEOAudit({ mode: "audit", business: { name: "ABC Dental", phone: "9999999999", businessType: "local_business" } });
  assert.ok(report.issues.some((issue) => issue.id === "local-business-missing-address"));
});

test("GBP missing primary category returns issue", () => {
  const report = runLocalSEOAudit({ mode: "audit", googleBusinessProfile: { exists: true, name: "ABC Dental", phone: "999", website: "https://example.com", openingHours: ["Mo-Fr"] } });
  assert.ok(report.issues.some((issue) => issue.id === "gbp-missing-primary-category"));
});

test("website NAP mismatch with GBP returns issue", () => {
  const report = runLocalSEOAudit({ mode: "audit", business: { name: "ABC Dental", phone: "111", address: { city: "Bangalore" } }, googleBusinessProfile: { name: "ABC Dental Clinic", phone: "222", address: { city: "Mumbai" } } });
  assert.ok(report.issues.some((issue) => issue.id === "website-gbp-name-mismatch"));
  assert.ok(report.issues.some((issue) => issue.id === "website-gbp-phone-mismatch"));
});

test("citation NAP mismatch returns issue", () => {
  const report = runLocalSEOAudit({ mode: "audit", business: { name: "ABC Dental", phone: "111" }, citations: [{ source: "directory", businessName: "ABC Clinic", phone: "222" }] });
  assert.ok(report.issues.some((issue) => issue.id === "citation-business-name-mismatch"));
});

test("thin local landing page returns issue", () => {
  const report = runLocalSEOAudit({ mode: "local_pages", pages: [{ url: "/bangalore", pageType: "local", city: "Bangalore", title: "Bangalore Dentist", h1: "Bangalore Dentist", bodyText: "Short local page", napVisible: true }] });
  assert.ok(report.issues.some((issue) => issue.id === "thin-local-landing-page"));
});

test("duplicate location pages return issue", () => {
  const body = "Unique enough local services copy repeated across locations for testing.";
  const report = runLocalSEOAudit({ mode: "local_pages", pages: [{ url: "/a", pageType: "location", bodyText: body }, { url: "/b", pageType: "location", bodyText: body }] });
  assert.ok(report.issues.some((issue) => issue.id === "duplicate-location-page-copy"));
});

test("local page missing NAP returns issue", () => {
  const report = runLocalSEOAudit({ mode: "local_pages", pages: [{ url: "/delhi", pageType: "local", city: "Delhi", title: "Delhi Dentist", h1: "Delhi Dentist", bodyText: "Dental services in Delhi with useful proof and details.", napVisible: false }] });
  assert.ok(report.issues.some((issue) => issue.id === "local-page-missing-nap"));
});

test("review rating outside 1-5 returns issue", () => {
  const report = runLocalSEOAudit({ mode: "reviews", reviews: [{ rating: 6, text: "Great" }] });
  assert.ok(report.issues.some((issue) => issue.id === "local-review-rating-out-of-range"));
});

test("LocalBusiness schema conflict returns issue", () => {
  const report = runLocalSEOAudit({ mode: "local_pages", business: { name: "ABC Dental", phone: "111" }, pages: [{ url: "/local", pageType: "local", localSchema: { name: "Other Dental", telephone: "222" } }] });
  assert.ok(report.issues.some((issue) => issue.id === "localbusiness-schema-name-conflict"));
});

test("hreflang missing self-reference returns issue", () => {
  const report = runHreflangAudit({ mode: "hreflang", hreflangSets: [{ sourceUrl: "https://example.com/en-in/", alternates: [{ lang: "en-US", url: "https://example.com/en-us/" }] }] });
  assert.ok(report.issues.some((issue) => issue.id === "hreflang-missing-self-reference"));
});

test("hreflang missing return tag returns issue", () => {
  const report = runHreflangAudit({ mode: "hreflang", pages: [{ url: "https://example.com/en-in/", isIndexable: true }, { url: "https://example.com/en-us/", isIndexable: true }], hreflangSets: [{ sourceUrl: "https://example.com/en-in/", alternates: [{ lang: "en-IN", url: "https://example.com/en-in/" }, { lang: "en-US", url: "https://example.com/en-us/" }] }] });
  assert.ok(report.issues.some((issue) => issue.id === "hreflang-missing-return-tag"));
});

test("invalid hreflang code returns issue", () => {
  const report = runHreflangAudit({ mode: "hreflang", hreflangSets: [{ sourceUrl: "https://example.com/en/", alternates: [{ lang: "english-IN", url: "https://example.com/en/" }] }] });
  assert.ok(report.issues.some((issue) => issue.id === "invalid-hreflang-code"));
});

test("hreflang to non-indexable URL returns issue", () => {
  const report = runHreflangAudit({ mode: "hreflang", pages: [{ url: "https://example.com/en/", isIndexable: false }], hreflangSets: [{ sourceUrl: "https://example.com/en/", alternates: [{ lang: "en", url: "https://example.com/en/" }] }] });
  assert.ok(report.issues.some((issue) => issue.id === "hreflang-to-non-indexable-url"));
});

test("localized page canonicalized to different language returns issue", () => {
  const report = runInternationalSEOAudit({ mode: "audit", pages: [{ url: "https://example.com/en/", language: "en", canonicalUrl: "https://example.com/fr/" }, { url: "https://example.com/fr/", language: "fr" }] });
  assert.ok(report.issues.some((issue) => issue.id === "localized-page-canonicalized-different-language"));
});

test("mixed language detected returns issue", () => {
  const report = runInternationalSEOAudit({ mode: "localization", localizedContent: [{ url: "https://example.com/fr/", mixedLanguageDetected: true }] });
  assert.ok(report.issues.some((issue) => issue.id === "mixed-language-detected"));
});

test("machine translation quality warning returns issue", () => {
  const report = runInternationalSEOAudit({ mode: "localization", localizedContent: [{ url: "https://example.com/fr/", translationQuality: "machine" }] });
  assert.ok(report.issues.some((issue) => issue.id === "machine-translation-quality-warning"));
});

test("missing x-default returns recommendation where relevant", () => {
  const report = runHreflangAudit({ mode: "hreflang", hreflangSets: [{ sourceUrl: "https://example.com/en/", alternates: [{ lang: "en", url: "https://example.com/en/" }] }] });
  assert.ok(report.issues.some((issue) => issue.id === "hreflang-missing-x-default"));
});

test("/seo-master help shows local/international commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master local-seo\s+\[active\]/u);
  assert.match(result.message, /\/seo-master local-seo-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master international-seo\s+\[active\]/u);
  assert.match(result.message, /\/seo-master international-seo-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master hreflang-audit\s+\[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP local/international tools use same logic surface", () => {
  const local = runLocalSEOAudit({ mode: "audit", business: { name: "ABC" } });
  const international = runInternationalSEOAudit({ mode: "audit", localizedContent: [{ url: "/fr", mixedLanguageDetected: true }] });
  const hreflang = runHreflangAudit({ mode: "hreflang", hreflangSets: [{ sourceUrl: "/en", alternates: [{ lang: "bad-code", url: "/en" }] }] });
  assert.ok(local.issues.some((issue) => issue.id === "local-business-missing-phone"));
  assert.ok(international.issues.some((issue) => issue.id === "mixed-language-detected"));
  assert.ok(hreflang.issues.some((issue) => issue.id === "invalid-hreflang-code"));
});
