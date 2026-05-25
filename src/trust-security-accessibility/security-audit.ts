import type { SecurityAuditInput, TSAIssue, TSAOutput } from "../types/trust-security-accessibility.ts";
import { issue, output, parseJsonFlag, score } from "./trust-audit.ts";

export function runSecurityAudit(input: SecurityAuditInput): TSAOutput {
  const normalized = mergeHtmlSecurityInput({ ...input, mode: input.mode ?? "security" });
  if (!hasInput(normalized)) return needsSecurityInput();
  const issues = [
    ...checkHttpsMixedContent(normalized),
    ...checkForms(normalized),
    ...checkSecuritySignals(normalized),
    ...checkHeaders(normalized)
  ];
  const missingInputs = missingInputsForSecurity(normalized);
  const status = missingInputs.length ? "partial" : "completed";
  return output(status, `Security SEO audit completed. Reviewed ${normalized.resources?.length ?? 0} resource(s), ${normalized.forms?.length ?? 0} form(s), and found ${issues.length} issue(s).`, issues, missingInputs, {
    securityFindings: [`HTTPS: ${normalized.page?.usesHttps === false ? "no" : normalized.page?.usesHttps === true ? "yes" : "not provided"}`]
  });
}

export function parseSecurityInputFromText(rawInput: string): SecurityAuditInput {
  const input: SecurityAuditInput = { mode: "security" };
  const args = rawInput.replace(/^\/seo-master\s+security-audit\s*/u, "").trim();
  for (const match of args.matchAll(/--([a-zA-Z][\w-]*)(?:\s+(?:"([^"]*)"|'([^']*)'|(\S+)))?/gu)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (key === "url") input.url = value;
    if (key === "html") input.html = value;
    if (key === "headers") input.headers = parseJsonFlag(value, undefined);
    if (key === "page") input.page = parseJsonFlag(value, undefined);
    if (key === "resources") input.resources = parseJsonFlag(value, []);
    if (key === "forms") input.forms = parseJsonFlag(value, []);
    if (key === "securitySignals" || key === "security-signals") input.securitySignals = parseJsonFlag(value, undefined);
  }
  return input;
}

function mergeHtmlSecurityInput(input: SecurityAuditInput): SecurityAuditInput {
  if (!input.html) return input;
  const resources = [...(input.resources ?? [])];
  for (const match of input.html.matchAll(/<(script|link|img|iframe)[^>]+(?:src|href)=["']([^"']+)["'][^>]*>/giu)) {
    const tag = (match[1] ?? "").toLowerCase();
    const url = match[2] ?? "";
    resources.push({ url, type: tag === "script" ? "script" : tag === "link" ? "stylesheet" : tag === "img" ? "image" : "iframe", isHttps: url.startsWith("https://") });
  }
  const forms = [...(input.forms ?? [])];
  for (const match of input.html.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/giu)) {
    const tag = match[0] ?? "";
    const body = match[1] ?? "";
    const action = /action=["']([^"']+)["']/iu.exec(tag)?.[1];
    const method = (/method=["']([^"']+)["']/iu.exec(tag)?.[1]?.toLowerCase() ?? "get") as "get" | "post";
    const fields = [...body.matchAll(/<(input|textarea|select)[^>]*>/giu)].map((field) => {
      const raw = field[0] ?? "";
      return { name: /name=["']([^"']+)["']/iu.exec(raw)?.[1], type: (/type=["']([^"']+)["']/iu.exec(raw)?.[1]?.toLowerCase() ?? "text") as "text", label: undefined };
    });
    forms.push({ action, method, usesHttps: action ? action.startsWith("https://") || action.startsWith("/") : undefined, hasCsrfToken: /csrf/iu.test(body), fields });
  }
  return { ...input, resources, forms, page: { ...input.page, hasForms: input.page?.hasForms ?? forms.length > 0, formCount: input.page?.formCount ?? forms.length } };
}

function checkHttpsMixedContent(input: SecurityAuditInput): TSAIssue[] {
  const issues: TSAIssue[] = [];
  if (input.page?.usesHttps === false) issues.push(issue("page-not-https", "https-mixed-content", "P1", "Page is not using HTTPS", "Serve public pages over HTTPS.", [input.page.url ?? input.url ?? "page"], ["security", "audit"]));
  for (const resource of input.resources ?? []) {
    const insecure = resource.isHttps === false || resource.url.startsWith("http://");
    if (insecure && input.page?.usesHttps !== false) issues.push(issue("mixed-content-resource", "https-mixed-content", ["script", "iframe"].includes(resource.type ?? "") ? "P1" : "P2", "HTTP resource on HTTPS page", "Update resources to HTTPS.", [resource.url], ["security", "audit"]));
  }
  return issues;
}

function checkForms(input: SecurityAuditInput): TSAIssue[] {
  const issues: TSAIssue[] = [];
  for (const form of input.forms ?? []) {
    const sensitive = (form.fields ?? []).some((field) => ["password", "email", "phone", "file"].includes(field.type ?? ""));
    if (form.action?.startsWith("http://") || form.usesHttps === false) issues.push(issue("http-form-action", "form-trust-safety", "P1", "Form action is not HTTPS", "Submit forms over HTTPS.", [form.action ?? "form"], ["security", "audit"]));
    if (sensitive && (form.method ?? "get") === "get") issues.push(issue("sensitive-form-uses-get", "form-trust-safety", "P1", "Sensitive form submits with GET", "Use POST for sensitive forms.", [form.action ?? "form"], ["security", "audit"]));
    if (sensitive && (form.usesHttps === false || input.page?.usesHttps === false)) issues.push(issue("sensitive-form-without-https", "form-trust-safety", "P0", "Sensitive form lacks HTTPS", "Do not collect sensitive data without HTTPS.", [form.action ?? input.page?.url ?? "form"], ["security", "audit"]));
    if ((form.method ?? "get") === "post" && form.hasCsrfToken === false) issues.push(issue("post-form-missing-csrf-token", "form-trust-safety", "P2", "POST form missing CSRF token input", "Add CSRF protection where relevant.", [form.action ?? "post form"], ["security", "audit"]));
    for (const field of form.fields ?? []) if (!field.label && field.type !== "hidden") issues.push(issue("security-form-field-missing-label", "form-trust-safety", "P3", "Form field missing visible label", "Label form fields clearly.", [field.name ?? field.type ?? "field"], ["security", "audit"]));
  }
  return issues;
}

function checkSecuritySignals(input: SecurityAuditInput): TSAIssue[] {
  const issues: TSAIssue[] = [];
  if (input.securitySignals?.malwareFlag) issues.push(issue("malware-flag", "malware-hacked-content", "P0", "Malware flag provided", "Immediately clean malware and request review after cleanup.", ["malwareFlag"], ["security", "audit"]));
  if (input.securitySignals?.hackedContentFlag) issues.push(issue("hacked-content-flag", "malware-hacked-content", "P0", "Hacked content flag provided", "Immediately remove hacked content and secure the site.", ["hackedContentFlag"], ["security", "audit"]));
  if (input.securitySignals?.spamInjectedContentFlag) issues.push(issue("spam-injected-content-flag", "malware-hacked-content", "P0", "Spam injection flag provided", "Clean injected spam and secure affected templates.", ["spamInjectedContentFlag"], ["security", "audit"]));
  if (input.securitySignals?.manualActionFlag) issues.push(issue("manual-action-flag", "malware-hacked-content", "P0", "Manual action flag provided", "Resolve the issue before reconsideration.", ["manualActionFlag"], ["security", "audit"]));
  return issues;
}

function checkHeaders(input: SecurityAuditInput): TSAIssue[] {
  if (!input.headers) return [];
  const lower = new Set(Object.keys(input.headers).map((key) => key.toLowerCase()));
  const issues: TSAIssue[] = [];
  for (const header of ["content-security-policy", "x-content-type-options", "referrer-policy"]) {
    if (!lower.has(header)) issues.push(issue(`missing-${header}`, "security-headers", "P3", `${header} header not provided`, "Review basic security headers.", [header], ["security", "audit"]));
  }
  if (input.page?.usesHttps === true && !lower.has("strict-transport-security")) issues.push(issue("missing-strict-transport-security", "security-headers", "P3", "Strict-Transport-Security header not provided", "Use HSTS after HTTPS is stable.", ["strict-transport-security"], ["security", "audit"]));
  return issues;
}

function hasInput(input: SecurityAuditInput): boolean {
  return Boolean(input.html || input.headers || input.page || input.resources?.length || input.forms?.length || input.securitySignals);
}

function missingInputsForSecurity(input: SecurityAuditInput): string[] {
  const missing: string[] = [];
  if (!input.page && !input.url && !input.html) missing.push("page or html");
  if (!input.headers) missing.push("headers");
  if (!input.resources?.length) missing.push("resources");
  if (!input.forms?.length) missing.push("forms");
  if (!input.securitySignals) missing.push("securitySignals");
  return missing;
}

function needsSecurityInput(): TSAOutput {
  return output("needs_input", "Needs input. Provide HTML, headers, page, resource, form, or security signal data.", [], ["html", "headers", "page", "resources", "forms", "securitySignals"], {});
}
