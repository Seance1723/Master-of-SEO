import type { ContentGap, ContentIssue } from "../types/content.ts";

export function buildContentRecommendations(issues: ContentIssue[], gaps: ContentGap[], missingInputs: string[]): string[] {
  const actions: string[] = [];
  if (missingInputs.length) actions.push(`Provide missing inputs for fuller coverage: ${missingInputs.join(", ")}.`);
  if (gaps.some((gap) => gap.type === "bofu_gap")) actions.push("Prioritize BOFU content gaps first.");
  if (issues.some((issue) => issue.priority === "P1")) actions.push("Resolve P1 planning issues before publishing.");
  actions.push("No live SERP, traffic, competitor, or keyword metric data was fetched.");
  return actions;
}
