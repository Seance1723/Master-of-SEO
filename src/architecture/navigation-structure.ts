import type { ArchitectureAuditInput, ArchitectureIssue } from "../types/architecture.ts";
import type { LinkGraph } from "./internal-linking.ts";
import { normalizeUrl } from "./url-utils.ts";

export function checkNavigation(input: ArchitectureAuditInput, graph: LinkGraph): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = [];
  const navUrls = new Set((input.navigation ?? []).map((item) => normalizeUrl(item.url)));
  const known = new Set([...(input.pages ?? []).map((page) => normalizeUrl(page.url)), ...(input.sitemapUrls ?? []).map(normalizeUrl)]);
  const topLevel = (input.navigation ?? []).filter((item) => (item.level ?? 1) === 1);
  if (topLevel.length > 12) issues.push(issue("navigation-too-many-top-level", "Too many top-level navigation items", "P2", `${topLevel.length} top-level items`));
  for (const item of input.navigation ?? []) {
    if (/^(click here|more|link)$/iu.test(item.label.trim())) issues.push(issue("navigation-vague-label", "Vague navigation label", "P3", item.label));
    if (!known.has(normalizeUrl(item.url))) issues.push(issue("navigation-url-not-found", "Navigation URL not found in pages or sitemap", "P3", item.url));
  }
  for (const page of input.pages ?? []) {
    const incoming = graph.incoming.get(normalizeUrl(page.url)) ?? [];
    if ((page.importance === "critical" || page.importance === "high") && !navUrls.has(normalizeUrl(page.url)) && incoming.length < 3) issues.push(issue("important-page-missing-navigation", "Important page missing from navigation with weak links", "P2", page.url));
  }
  return issues;
}

function issue(id: string, title: string, priority: ArchitectureIssue["priority"], evidence: string): ArchitectureIssue {
  return { id, category: "navigation", title, priority, problem: evidence, whyItMatters: "Navigation helps users and crawlers reach important pages.", howToFix: "Use clear crawlable navigation for important URLs without overloading menus.", do: ["Include important pages in main navigation where appropriate", "Use clear navigation labels", "Keep navigation crawlable"], dont: ["Hide key pages behind scripts only", "Overload navigation with every page", "Use vague labels"], evidence: [evidence], appliesTo: ["architecture", "internal_linking", "crawlability", "audit"] };
}
