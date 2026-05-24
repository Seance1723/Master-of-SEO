import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";

export const statusCodeRules: TechnicalRule[] = [
  {
    id: "status-codes-core",
    category: "http status codes",
    title: "HTTP status code correctness",
    description: "Pages should return status codes that match their real availability.",
    do: ["Return 200 for live pages", "Return 404 for missing pages", "Return 410 for permanently removed pages", "Return 503 for temporary maintenance"],
    dont: ["Return 200 for error pages", "Create soft 404s", "Leave important pages with 5xx errors"],
    priority: "P0",
    appliesTo: ["website", "page", "technical", "audit"],
    status: "active"
  }
];

export function checkStatusCode(input: TechnicalAuditInput): { issues: TechnicalAuditIssue[]; passedChecks: string[] } {
  const status = input.statusCode;
  if (!status) return { issues: [], passedChecks: [] };
  const issues: TechnicalAuditIssue[] = [];
  if (status >= 500) {
    issues.push(issue("status-5xx", "5xx server error", `Provided status code is ${status}.`, "P0"));
  } else if (status === 404 || status === 410) {
    const highImportance = JSON.stringify(input.pages ?? []).toLowerCase().includes("high");
    issues.push(issue(`status-${status}`, `${status} unavailable page`, `Provided status code is ${status}.`, highImportance ? "P1" : "P2"));
  } else if (status === 200) {
    return { issues, passedChecks: ["Provided status code is 200."] };
  }
  return { issues, passedChecks: [] };
}

function issue(id: string, title: string, problem: string, priority: "P0" | "P1" | "P2"): TechnicalAuditIssue {
  return {
    id,
    category: "http status codes",
    title,
    priority,
    problem,
    whyItMatters: "Incorrect status codes can block crawling, indexing, or user access.",
    howToFix: "Return the correct HTTP status for the page state.",
    do: statusCodeRules[0].do,
    dont: statusCodeRules[0].dont,
    evidence: [problem],
    appliesTo: ["page", "technical", "audit"]
  };
}
