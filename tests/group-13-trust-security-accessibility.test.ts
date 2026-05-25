import assert from "node:assert/strict";
import { test } from "node:test";
import { getCommands } from "../src/core/command-registry.ts";
import { runSeoMaster } from "../src/core/orchestrator.ts";
import { getScoreWeightTotal, getScoreWeights } from "../src/core/score-engine.ts";
import { runAccessibilityAudit } from "../src/trust-security-accessibility/accessibility-audit.ts";
import { runEEATAudit } from "../src/trust-security-accessibility/eeat-audit.ts";
import { runSecurityAudit } from "../src/trust-security-accessibility/security-audit.ts";
import { runTrustAudit } from "../src/trust-security-accessibility/trust-audit.ts";

test("/seo-master trust-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "trust-audit")?.status, "active");
});

test("/seo-master eeat-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "eeat-audit")?.status, "active");
});

test("/seo-master security-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "security-audit")?.status, "active");
});

test("/seo-master accessibility-audit is active", async () => {
  assert.equal((await getCommands()).find((command) => command.id === "accessibility-audit")?.status, "active");
});

test("without input, trust audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master trust-audit");
  assert.equal(result.type, "trust-security-accessibility-audit");
  assert.equal((result.data as ReturnType<typeof runTrustAudit>).status, "needs_input");
});

test("without input, security audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master security-audit");
  assert.equal(result.type, "trust-security-accessibility-audit");
  assert.equal((result.data as ReturnType<typeof runSecurityAudit>).status, "needs_input");
});

test("without input, accessibility audit returns needs_input", async () => {
  const result = await runSeoMaster("/seo-master accessibility-audit");
  assert.equal(result.type, "trust-security-accessibility-audit");
  assert.equal((result.data as ReturnType<typeof runAccessibilityAudit>).status, "needs_input");
});

test("commercial site missing contact returns issue", () => {
  const report = runTrustAudit({ mode: "trust", page: { pageType: "service" }, organization: { name: "Example" }, trustPages: { privacyPolicyUrl: "/privacy", termsUrl: "/terms" } });
  assert.ok(report.issues.some((issue) => issue.id === "commercial-site-missing-contact"));
});

test("missing privacy policy returns issue", () => {
  const report = runTrustAudit({ mode: "trust", page: { pageType: "service" }, organization: { name: "Example", email: "hi@example.com" }, trustPages: { contactUrl: "/contact" } });
  assert.ok(report.issues.some((issue) => issue.id === "missing-privacy-policy"));
});

test("ecommerce site missing refund/shipping policy returns issue", () => {
  const report = runTrustAudit({ mode: "policy", page: { pageType: "ecommerce" }, organization: { name: "Shop", email: "hi@example.com" }, trustPages: { contactUrl: "/contact", privacyPolicyUrl: "/privacy", termsUrl: "/terms" } });
  assert.ok(report.issues.some((issue) => issue.id === "missing-refund-policy"));
  assert.ok(report.issues.some((issue) => issue.id === "missing-shipping-policy"));
});

test("YMYL page without author/reviewer credentials returns issue", () => {
  const report = runEEATAudit({ mode: "eeat", page: { pageType: "article", isYMYL: true, title: "Financial advice" }, authors: [{ name: "A" }] });
  assert.ok(report.issues.some((issue) => issue.id === "ymyl-missing-expert-author-reviewer"));
});

test("testimonial rating outside 1-5 returns issue", () => {
  const report = runTrustAudit({ mode: "trust", testimonials: [{ name: "Jane", rating: 6 }] });
  assert.ok(report.issues.some((issue) => issue.id === "testimonial-rating-out-of-range"));
});

test("usesHttps false returns P0/P1 issue", () => {
  const report = runSecurityAudit({ mode: "security", page: { usesHttps: false, url: "http://example.com" } });
  assert.ok(report.issues.some((issue) => issue.id === "page-not-https" && ["P0", "P1"].includes(issue.priority)));
});

test("HTTP form action returns issue", () => {
  const report = runSecurityAudit({ mode: "forms", forms: [{ action: "http://example.com/form", method: "post", usesHttps: false, fields: [{ type: "email", label: "Email" }] }] });
  assert.ok(report.issues.some((issue) => issue.id === "http-form-action"));
});

test("sensitive form using GET returns issue", () => {
  const report = runSecurityAudit({ mode: "forms", forms: [{ action: "https://example.com/login", method: "get", usesHttps: true, fields: [{ type: "password", label: "Password" }] }] });
  assert.ok(report.issues.some((issue) => issue.id === "sensitive-form-uses-get"));
});

test("malwareFlag true returns P0 issue", () => {
  const report = runSecurityAudit({ mode: "security", securitySignals: { malwareFlag: true } });
  assert.ok(report.issues.some((issue) => issue.id === "malware-flag" && issue.priority === "P0"));
});

test("hackedContentFlag true returns P0 issue", () => {
  const report = runSecurityAudit({ mode: "security", securitySignals: { hackedContentFlag: true } });
  assert.ok(report.issues.some((issue) => issue.id === "hacked-content-flag" && issue.priority === "P0"));
});

test("missing H1 returns accessibility issue", () => {
  const report = runAccessibilityAudit({ mode: "accessibility", page: { title: "Page", language: "en" }, headings: [{ level: "h2", text: "Section" }] });
  assert.ok(report.issues.some((issue) => issue.id === "accessibility-missing-h1"));
});

test("multiple H1s return issue", () => {
  const report = runAccessibilityAudit({ mode: "accessibility", page: { title: "Page", language: "en" }, headings: [{ level: "h1", text: "One" }, { level: "h1", text: "Two" }] });
  assert.ok(report.issues.some((issue) => issue.id === "accessibility-multiple-h1"));
});

test("image missing alt returns issue", () => {
  const report = runAccessibilityAudit({ mode: "accessibility", page: { title: "Page", language: "en" }, headings: [{ level: "h1", text: "Page" }], images: [{ src: "/hero.jpg" }] });
  assert.ok(report.issues.some((issue) => issue.id === "accessibility-image-missing-alt"));
});

test("decorative image with empty alt passes", () => {
  const report = runAccessibilityAudit({ mode: "accessibility", page: { title: "Page", language: "en" }, headings: [{ level: "h1", text: "Page" }], images: [{ src: "/decor.svg", alt: "", isDecorative: true }] });
  assert.ok(!report.issues.some((issue) => issue.id === "accessibility-image-missing-alt"));
});

test("button with no text/aria-label returns issue", () => {
  const report = runAccessibilityAudit({ mode: "accessibility", buttons: [{ type: "button" }] });
  assert.ok(report.issues.some((issue) => issue.id === "accessibility-button-missing-name"));
});

test("form field missing label/aria-label returns issue", () => {
  const report = runAccessibilityAudit({ mode: "forms", forms: [{ fields: [{ name: "email", type: "email" }] }] });
  assert.ok(report.issues.some((issue) => issue.id === "accessibility-form-field-missing-label"));
});

test("keyboardTrapsKnown true returns P1 issue", () => {
  const report = runAccessibilityAudit({ mode: "accessibility", accessibilitySignals: { keyboardTrapsKnown: true } });
  assert.ok(report.issues.some((issue) => issue.id === "accessibility-keyboard-trap-known" && issue.priority === "P1"));
});

test("lowContrastKnown true returns issue", () => {
  const report = runAccessibilityAudit({ mode: "accessibility", accessibilitySignals: { lowContrastKnown: true } });
  assert.ok(report.issues.some((issue) => issue.id === "accessibility-low-contrast-known"));
});

test("/seo-master help shows Group 13 commands as active", async () => {
  const result = await runSeoMaster("/seo-master help");
  assert.match(result.message, /\/seo-master trust-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master eeat-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master security-audit\s+\[active\]/u);
  assert.match(result.message, /\/seo-master accessibility-audit\s+\[active\]/u);
});

test("score weights still total 100", async () => {
  assert.equal(getScoreWeightTotal(await getScoreWeights()), 100);
});

test("MCP trust/security/accessibility tools use same logic surface", () => {
  assert.ok(runTrustAudit({ mode: "trust", page: { pageType: "service" }, trustPages: {} }).issues.some((issue) => issue.id === "commercial-site-missing-contact"));
  assert.ok(runSecurityAudit({ mode: "security", securitySignals: { malwareFlag: true } }).issues.some((issue) => issue.id === "malware-flag"));
  assert.ok(runAccessibilityAudit({ mode: "accessibility", buttons: [{}] }).issues.some((issue) => issue.id === "accessibility-button-missing-name"));
});
