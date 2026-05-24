import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";

export const canonicalRules: TechnicalRule[] = [
  {
    id: "canonicalization-core",
    category: "canonicalization",
    title: "Canonical signal consistency",
    description: "Canonical tags should point to the preferred indexable URL and align with internal links and sitemaps.",
    do: ["Use self-canonical on indexable pages", "Canonicalize duplicates to preferred URL", "Keep canonical consistent with sitemap/internal links"],
    dont: ["Canonicalize unrelated pages", "Canonicalize to blocked/noindex/redirected URLs", "Create canonical chains or loops"],
    priority: "P1",
    appliesTo: ["website", "page", "technical", "audit"],
    status: "active"
  }
];

export function checkCanonicalization(input: TechnicalAuditInput): { issues: TechnicalAuditIssue[]; passedChecks: string[] } {
  const issues: TechnicalAuditIssue[] = [];
  const passedChecks: string[] = [];
  if (!input.html) return { issues, passedChecks };
  const canonicals = [...input.html.matchAll(/<link\b(?=[^>]*rel\s*=\s*["']canonical["'])(?=[^>]*href\s*=\s*["']([^"']+)["'])[^>]*>/giu)].map((match) => match[1]);

  if (canonicals.length === 0) {
    issues.push(issue("canonical-missing", "Missing canonical tag", "Provided HTML does not include a canonical tag.", ["No rel=canonical tag found"], "P2"));
  } else {
    passedChecks.push("Canonical tag found in provided HTML.");
  }

  if (canonicals.length > 1) {
    issues.push(issue("canonical-multiple", "Multiple canonical tags", "Provided HTML includes multiple canonical tags.", canonicals, "P1"));
  }

  if (input.canonicalUrl && input.url && normalize(input.canonicalUrl) !== normalize(input.url)) {
    issues.push(issue("canonical-different-url", "Canonical points to a different URL", "Provided canonical URL differs from the page URL.", [`url=${input.url}`, `canonical=${input.canonicalUrl}`], "P2"));
  }

  return { issues, passedChecks };
}

function normalize(url: string): string {
  return url.replace(/\/+$/u, "").toLowerCase();
}

function issue(id: string, title: string, problem: string, evidence: string[], priority: "P1" | "P2" | "P3"): TechnicalAuditIssue {
  return {
    id,
    category: "canonicalization",
    title,
    priority,
    problem,
    whyItMatters: "Canonical conflicts can split signals or cause the wrong URL to rank.",
    howToFix: "Use one canonical tag pointing to the preferred indexable URL.",
    do: canonicalRules[0].do,
    dont: canonicalRules[0].dont,
    evidence,
    appliesTo: ["page", "technical", "audit"]
  };
}
