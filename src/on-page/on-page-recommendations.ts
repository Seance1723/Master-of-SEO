import type { OnPageAuditIssue } from "../types/on-page.ts";

export function buildOnPageRecommendations(issues: OnPageAuditIssue[], missingInputs: string[]): string[] {
  const actions: string[] = [];
  if (missingInputs.length) actions.push(`Provide missing inputs for fuller coverage: ${missingInputs.join(", ")}.`);
  if (issues.some((issue) => issue.priority === "P1")) actions.push("Fix P1 title, H1, content, and conversion blockers first.");
  if (issues.some((issue) => issue.priority === "P2")) actions.push("Address P2 metadata, headings, links, and image alt issues next.");
  actions.push("No live crawling was performed; results are limited to supplied HTML and on-page inputs.");
  return actions;
}
