import type { OnPageAuditInput, OnPageAuditIssue, OnPageRule } from "../types/on-page.ts";

export const metaDescriptionRules: OnPageRule[] = [{
  id: "meta-description-core",
  category: "meta-description",
  title: "Meta description quality",
  description: "Meta descriptions should summarize page value and match intent.",
  do: ["Write unique meta descriptions", "Summarize page value clearly", "Include a natural CTA where useful", "Match the page intent", "Use benefit-driven copy"],
  dont: ["Duplicate meta descriptions", "Stuff keywords", "Write generic descriptions", "Mislead users", "Leave important commercial pages without descriptions"],
  priority: "P2",
  appliesTo: ["website", "page", "content", "on_page", "audit"],
  status: "active"
}];

export function checkMetaDescription(input: OnPageAuditInput): { issues: OnPageAuditIssue[]; passedChecks: string[] } {
  const description = input.metaDescription?.trim();
  const issues: OnPageAuditIssue[] = [];
  if (!description) issues.push(issue("meta-description-missing", "Missing meta description", "P2", "No meta description was provided or extracted.", "Add a unique description that summarizes page value."));
  else {
    if (description.length < 50) issues.push(issue("meta-description-too-short", "Meta description is short", "P3", `Description is ${description.length} characters.`, "Use more specific benefit-driven copy."));
    if (description.length > 160) issues.push(issue("meta-description-too-long", "Meta description is long", "P2", `Description is ${description.length} characters.`, "Trim the description to the clearest value proposition."));
    if (input.title && description.toLowerCase() === input.title.toLowerCase()) issues.push(issue("meta-description-duplicates-title", "Meta description duplicates title", "P3", description, "Write a distinct summary rather than repeating the title."));
    if (isStuffed(description)) issues.push(issue("meta-description-keyword-stuffing", "Meta description may be keyword-stuffed", "P2", description, "Rewrite the description naturally."));
  }
  return { issues, passedChecks: description && !issues.length ? ["Meta description checks passed."] : [] };
}

function isStuffed(text: string): boolean {
  const words = text.toLowerCase().split(/\W+/u).filter((word) => word.length > 3);
  return words.some((word) => words.filter((item) => item === word).length >= 3);
}

function issue(id: string, title: string, priority: "P2" | "P3", evidence: string, howToFix: string): OnPageAuditIssue {
  return {
    id,
    category: "meta-description",
    title,
    priority,
    problem: evidence,
    whyItMatters: "Meta descriptions can affect search result clarity and click-through.",
    howToFix,
    do: metaDescriptionRules[0].do,
    dont: metaDescriptionRules[0].dont,
    evidence: [evidence],
    appliesTo: ["page", "content", "on_page", "audit"]
  };
}
