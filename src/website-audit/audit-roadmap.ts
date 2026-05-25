import type { WebsiteAuditIssue, WebsiteAuditOutput } from "../types/website-audit.ts";

export function generateRoadmap(issues: WebsiteAuditIssue[]): WebsiteAuditOutput["roadmap"] {
  return {
    first7Days: issues.filter((issue) => issue.priority === "P0").map(toTask),
    first30Days: issues.filter((issue) => issue.priority === "P1").map(toTask),
    days31To60: issues.filter((issue) => issue.priority === "P2").map(toTask),
    days61To90: issues.filter((issue) => issue.priority === "P3").map(toTask)
  };
}

function toTask(issue: WebsiteAuditIssue): string {
  return `Fix ${issue.priority}: ${issue.title}`;
}
