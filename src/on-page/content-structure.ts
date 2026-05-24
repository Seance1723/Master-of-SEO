import type { OnPageAuditInput, OnPageAuditIssue, OnPageRule } from "../types/on-page.ts";

export const contentStructureRules: OnPageRule[] = [{
  id: "content-structure-core",
  category: "content-structure",
  title: "Content structure",
  description: "Content should satisfy intent quickly, clearly, and completely.",
  do: ["Place the main value/answer early", "Match search intent", "Include useful sections, examples, FAQs, proof, and internal links", "Write for humans first", "Support topical clarity"],
  dont: ["Write vague intros", "Create thin pages", "Copy competitor content", "Publish generic AI-style filler", "Mix too many unrelated topics on one page"],
  priority: "P1",
  appliesTo: ["website", "page", "content", "on_page", "audit"],
  status: "active"
}];

export function checkContentStructure(input: OnPageAuditInput): { issues: OnPageAuditIssue[]; passedChecks: string[] } {
  const issues: OnPageAuditIssue[] = [];
  const words = input.bodyText?.split(/\s+/u).filter(Boolean).length ?? 0;
  if (isImportant(input) && input.bodyText !== undefined && words < 150) issues.push(issue("content-thin-important-page", "Important page has thin body text", input.pageType === "product" || input.pageType === "service" ? "P1" : "P2", `${words} words found.`, "Add useful, intent-matching content and proof."));
  if (input.bodyText && /^(welcome to|in today's digital world|in the ever-evolving|are you looking for)/iu.test(input.bodyText.trim())) issues.push(issue("content-vague-intro", "Vague intro detected", "P3", input.bodyText.slice(0, 90), "Start with specific value or the direct answer."));
  return { issues, passedChecks: input.bodyText && !issues.length ? ["Content structure checks passed."] : [] };
}

function isImportant(input: OnPageAuditInput): boolean {
  return ["homepage", "service", "product", "category", "landing", "pricing"].includes(input.pageType ?? "");
}

function issue(id: string, title: string, priority: "P1" | "P2" | "P3", evidence: string, howToFix: string): OnPageAuditIssue {
  return {
    id,
    category: "content-structure",
    title,
    priority,
    problem: evidence,
    whyItMatters: "Thin or vague content can miss intent and weaken conversion.",
    howToFix,
    do: contentStructureRules[0].do,
    dont: contentStructureRules[0].dont,
    evidence: [evidence],
    appliesTo: ["page", "content", "on_page", "audit"]
  };
}
