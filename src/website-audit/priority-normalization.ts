import type { WebsiteAuditIssue } from "../types/website-audit.ts";

export function normalizePriority(issue: WebsiteAuditIssue): WebsiteAuditIssue {
  const text = `${issue.id} ${issue.category} ${issue.title} ${issue.problem}`.toLowerCase();
  if (/sitewide noindex|blocked|5xx|build failed|malware|hacked|manual action|sensitive form|p0/u.test(text)) return { ...issue, priority: "P0" };
  if (/noindex|missing h1|missing title|canonical|core web vitals|fake review|empty indexable|mismatch|p1/u.test(text) && issue.priority !== "P0") return { ...issue, priority: "P1" };
  if (/missing description|schema|thin|internal link|accessibility|p2/u.test(text) && !["P0", "P1"].includes(issue.priority)) return { ...issue, priority: "P2" };
  return issue;
}
