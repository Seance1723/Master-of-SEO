import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";

export const redirectRules: TechnicalRule[] = [
  {
    id: "redirects-core",
    category: "redirects",
    title: "Redirect hygiene",
    description: "Redirects should preserve relevance and avoid chains or loops.",
    do: ["Use 301/308 for permanent moves", "Use 302/307 for temporary moves", "Redirect to closest relevant page", "Update internal links after redirects"],
    dont: ["Redirect everything to homepage", "Create redirect chains", "Create redirect loops", "Use JS redirects for critical SEO moves"],
    priority: "P1",
    appliesTo: ["website", "page", "technical", "audit"],
    status: "active"
  }
];

export function checkRedirects(input: TechnicalAuditInput): { issues: TechnicalAuditIssue[]; passedChecks: string[] } {
  if (!input.statusCode || input.statusCode < 300 || input.statusCode >= 400) return { issues: [], passedChecks: [] };
  return {
    issues: [
      {
        id: "redirect-status-code",
        category: "redirects",
        title: "Redirect status code found",
        priority: input.statusCode === 301 || input.statusCode === 308 ? "P3" : "P2",
        problem: `Provided status code is ${input.statusCode}.`,
        whyItMatters: "Redirects should be intentional, relevant, and reflected in internal links.",
        howToFix: "Confirm the redirect target is the closest relevant URL and update internal links.",
        do: redirectRules[0].do,
        dont: redirectRules[0].dont,
        evidence: [`statusCode=${input.statusCode}`],
        appliesTo: ["page", "technical", "audit"]
      }
    ],
    passedChecks: []
  };
}
