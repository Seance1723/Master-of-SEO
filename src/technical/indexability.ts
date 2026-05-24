import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";

export const indexabilityRules: TechnicalRule[] = [
  {
    id: "indexability-core",
    category: "indexability",
    title: "Indexability control",
    description: "Important pages should be indexable; low-value utility pages should be noindexed.",
    do: ["Keep important pages indexable", "Noindex admin, login, cart, checkout, staging, thank-you, and internal search pages", "Check noindex mistakes"],
    dont: ["Noindex important landing pages", "Index placeholder pages", "Index duplicate filtered pages", "Assume sitemap submission means indexing"],
    priority: "P1",
    appliesTo: ["website", "page", "technical", "audit"],
    status: "active"
  }
];

export function checkIndexability(input: TechnicalAuditInput, hasNoindex: boolean): { issues: TechnicalAuditIssue[]; passedChecks: string[] } {
  const issues: TechnicalAuditIssue[] = [];
  const passedChecks: string[] = [];
  const html = input.html;

  if (hasNoindex) {
    issues.push({
      id: "indexability-noindex-found",
      category: "indexability",
      title: "Noindex directive found",
      priority: isImportantPage(input) ? "P1" : "P2",
      problem: "Provided page includes a noindex directive.",
      whyItMatters: "Noindex prevents the page from appearing in search results.",
      howToFix: "Remove noindex from important pages; keep it only on pages intentionally excluded from search.",
      do: indexabilityRules[0].do,
      dont: indexabilityRules[0].dont,
      evidence: ["noindex found in provided directives"],
      appliesTo: ["page", "technical", "audit"]
    });
  } else if (html) {
    passedChecks.push("No meta robots noindex directive found in provided HTML.");
  }

  if (html && isPlaceholderHtml(html)) {
    issues.push({
      id: "indexability-placeholder-content",
      category: "indexability",
      title: "Placeholder or thin HTML detected",
      priority: "P2",
      problem: "Provided HTML appears empty or placeholder-like.",
      whyItMatters: "Placeholder pages are poor index candidates and can dilute site quality.",
      howToFix: "Add useful primary content or keep the page noindexed until ready.",
      do: indexabilityRules[0].do,
      dont: indexabilityRules[0].dont,
      evidence: ["Placeholder or very low text content found"],
      appliesTo: ["page", "technical", "audit"]
    });
  }

  return { issues, passedChecks };
}

function isImportantPage(input: TechnicalAuditInput): boolean {
  const pageText = JSON.stringify(input.pages ?? []).toLowerCase();
  const url = input.url?.toLowerCase() ?? "";
  return /important|high|landing|product|service|pricing|home/.test(pageText + " " + url);
}

function isPlaceholderHtml(html: string): boolean {
  const text = html.replace(/<script[\s\S]*?<\/script>/giu, "").replace(/<style[\s\S]*?<\/style>/giu, "").replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim().toLowerCase();
  return text.length < 40 || /\b(lorem ipsum|coming soon|placeholder|todo)\b/u.test(text);
}
