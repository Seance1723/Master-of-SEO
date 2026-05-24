import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";

export const xRobotsTagRules: TechnicalRule[] = [
  {
    id: "x-robots-tag-core",
    category: "x-robots-tag",
    title: "X-Robots-Tag directives",
    description: "Use X-Robots-Tag for file-level and non-HTML indexing control.",
    do: ["Support PDF/file-level indexing control", "Use X-Robots-Tag for non-HTML assets"],
    dont: ["Conflict with page-level directives", "Noindex important downloadable assets unless intentional"],
    priority: "P2",
    appliesTo: ["website", "technical", "audit"],
    status: "active"
  }
];

export function checkXRobotsTag(input: TechnicalAuditInput): { issues: TechnicalAuditIssue[]; passedChecks: string[]; hasNoindex: boolean } {
  const headerValue = getHeader(input.headers, "x-robots-tag");
  if (!headerValue) return { issues: [], passedChecks: [], hasNoindex: false };
  const value = headerValue.toLowerCase();
  const issues: TechnicalAuditIssue[] = [];
  if (value.includes("noindex")) {
    issues.push({
      id: "x-robots-tag-noindex",
      category: "x-robots-tag",
      title: "X-Robots-Tag noindex found",
      priority: "P2",
      problem: "Provided headers include X-Robots-Tag noindex.",
      whyItMatters: "X-Robots-Tag noindex prevents indexing, including for non-HTML assets.",
      howToFix: "Keep only if the asset or page should be excluded from search.",
      do: xRobotsTagRules[0].do,
      dont: xRobotsTagRules[0].dont,
      evidence: [`X-Robots-Tag: ${headerValue}`],
      appliesTo: ["website", "page", "technical", "audit"]
    });
  }
  return { issues, passedChecks: ["X-Robots-Tag header reviewed."], hasNoindex: value.includes("noindex") };
}

function getHeader(headers: TechnicalAuditInput["headers"], name: string): string | undefined {
  const entry = Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === name);
  const value = entry?.[1];
  return Array.isArray(value) ? value.join(", ") : value;
}
