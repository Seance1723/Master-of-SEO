import type { OnPageAuditInput, OnPageAuditIssue, OnPageRule } from "../types/on-page.ts";

export const titleTagRules: OnPageRule[] = [{
  id: "title-tag-core",
  category: "title-tag",
  title: "Title tag quality",
  description: "Title tags should be unique, clear, intent-aligned, and naturally include the primary topic.",
  do: ["Create a unique title per page", "Keep the title aligned with search intent", "Include the primary topic naturally", "Make it click-worthy but honest", "Keep important words near the beginning"],
  dont: ["Duplicate title tags across pages", "Keyword-stuff titles", "Make titles misleading", "Make titles too vague", "Use the same title as the H1 automatically unless it fits"],
  priority: "P1",
  appliesTo: ["website", "page", "content", "on_page", "audit"],
  status: "active"
}];

export function checkTitleTag(input: OnPageAuditInput): { issues: OnPageAuditIssue[]; passedChecks: string[] } {
  const title = input.title?.trim();
  const issues: OnPageAuditIssue[] = [];
  if (!title) issues.push(issue("title-missing", "Missing title tag", "P1", "No title tag was provided or extracted.", "Add a unique, intent-aligned title tag."));
  else {
    if (title.length < 20) issues.push(issue("title-too-short", "Title tag is too short", "P2", `Title is ${title.length} characters.`, "Expand the title to describe the page value clearly."));
    if (title.length > 65) issues.push(issue("title-too-long", "Title tag is too long", "P2", `Title is ${title.length} characters.`, "Keep the title focused and front-load important words."));
    if (isStuffed(title)) issues.push(issue("title-keyword-stuffing", "Title may be keyword-stuffed", "P2", title, "Rewrite the title in natural, user-first language."));
    if (input.primaryKeyword && !title.toLowerCase().includes(input.primaryKeyword.toLowerCase())) issues.push(issue("title-missing-primary-topic", "Title missing primary topic", "P2", `Primary keyword not found: ${input.primaryKeyword}`, "Include the primary topic naturally if it matches intent."));
    if (input.h1 && title.toLowerCase() === input.h1.toLowerCase() && /^(home|welcome|services|products)$/iu.test(title)) issues.push(issue("title-h1-generic-duplicate", "Title duplicates a generic H1", "P3", title, "Make title and H1 specific when the shared text is generic."));
  }
  return { issues, passedChecks: title && !issues.length ? ["Title tag checks passed."] : [] };
}

function isStuffed(text: string): boolean {
  const words = text.toLowerCase().split(/\W+/u).filter((word) => word.length > 3);
  return /(.+?)\s*\|\s*\1/iu.test(text) || words.some((word) => words.filter((item) => item === word).length >= 3);
}

function issue(id: string, title: string, priority: "P1" | "P2" | "P3", evidence: string, howToFix: string): OnPageAuditIssue {
  return {
    id,
    category: "title-tag",
    title,
    priority,
    problem: evidence,
    whyItMatters: "Title tags strongly influence relevance, snippets, and click-through.",
    howToFix,
    do: titleTagRules[0].do,
    dont: titleTagRules[0].dont,
    evidence: [evidence],
    appliesTo: ["page", "content", "on_page", "audit"]
  };
}
