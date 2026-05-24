import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";

export const urlStructureRules: TechnicalRule[] = [
  {
    id: "url-structure-core",
    category: "url structure",
    title: "Clean URL structure",
    description: "URLs should be readable, stable, lowercase, and canonical.",
    do: ["Use short lowercase readable URLs", "Use hyphens", "Keep URLs stable", "Use logical hierarchy"],
    dont: ["Use session IDs", "Keyword-stuff URLs", "Change URLs without redirects", "Create multiple URL versions for same page"],
    priority: "P2",
    appliesTo: ["website", "page", "technical", "audit"],
    status: "active"
  }
];

export function checkUrlStructure(input: TechnicalAuditInput): { issues: TechnicalAuditIssue[]; passedChecks: string[] } {
  const url = input.url;
  if (!url) return { issues: [], passedChecks: [] };
  const issues: TechnicalAuditIssue[] = [];
  const add = (id: string, title: string, problem: string, evidence: string[], priority: "P1" | "P2" | "P3" = "P2") => {
    issues.push({
      id,
      category: "url structure",
      title,
      priority,
      problem,
      whyItMatters: "Messy URLs can create duplication, tracking leakage, and lower usability.",
      howToFix: "Use stable, lowercase, hyphenated, readable URLs and redirect changed URLs.",
      do: urlStructureRules[0].do,
      dont: urlStructureRules[0].dont,
      evidence,
      appliesTo: ["website", "page", "technical", "audit"]
    });
  };

  if (/[A-Z]/u.test(url)) add("url-uppercase", "Uppercase URL characters", "URL contains uppercase characters.", [url], "P3");
  if (/_/u.test(url)) add("url-underscores", "URL uses underscores", "URL contains underscores instead of hyphens.", [url], "P3");
  if (/[?&](phpsessid|sessionid|sid|jsessionid)=/iu.test(url)) add("url-session-id", "Session ID in URL", "URL contains a session identifier.", [url], "P1");
  const query = url.split("?")[1] ?? "";
  if (query && query.split("&").filter(Boolean).length > 4) add("url-excessive-query-params", "Excessive query parameters", "URL has many query parameters.", [url], "P2");
  if (url.length > 115) add("url-too-long", "Very long URL", "URL is longer than 115 characters.", [`${url.length} characters`], "P3");

  return { issues, passedChecks: issues.length ? [] : ["URL structure checks passed for provided URL."] };
}
