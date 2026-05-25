import type { ArchitectureAuditInput, ArchitectureIssue } from "../types/architecture.ts";
import { normalizeUrl } from "./url-utils.ts";

export function checkBreadcrumbs(input: ArchitectureAuditInput): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = [];
  const trails = new Map((input.breadcrumbs ?? []).map((trail) => [normalizeUrl(trail.pageUrl), trail]));
  for (const page of input.pages ?? []) {
    const hierarchical = ["category", "product", "documentation"].includes(page.pageType ?? "");
    const trail = trails.get(normalizeUrl(page.url));
    if (hierarchical && !trail) issues.push(issue("breadcrumbs-missing", "Missing breadcrumbs on hierarchical page", "P2", page.url));
    if (trail) {
      if (!trail.items.some((item) => item.url === "/" || item.position === 1 || /home/i.test(item.label))) issues.push(issue("breadcrumbs-missing-home", "Breadcrumb path missing homepage/root", "P3", page.url));
      for (const item of trail.items.slice(0, -1)) if (!item.url) issues.push(issue("breadcrumb-item-missing-url", "Breadcrumb item missing URL", "P3", item.label));
      const pathParts = normalizeUrl(page.url).split("/").filter(Boolean);
      if (pathParts.length > 1 && trail.items.length > 1 && !normalizeUrl(page.url).includes(normalizeUrl(trail.items[trail.items.length - 1].url ?? page.url))) issues.push(issue("breadcrumb-conflicts-hierarchy", "Breadcrumb may conflict with URL hierarchy", "P3", page.url));
    }
  }
  return issues;
}

function issue(id: string, title: string, priority: ArchitectureIssue["priority"], evidence: string): ArchitectureIssue {
  return { id, category: "breadcrumbs", title, priority, problem: evidence, whyItMatters: "Breadcrumbs reinforce hierarchy, navigation, and future BreadcrumbList schema.", howToFix: "Add crawlable breadcrumbs matching canonical hierarchy.", do: ["Use breadcrumbs for hierarchical sites", "Keep breadcrumb links crawlable", "Match breadcrumb path to site structure"], dont: ["Use breadcrumbs that conflict with canonical hierarchy", "Show fake hierarchy"], evidence: [evidence], appliesTo: ["architecture", "internal_linking", "planning", "audit"] };
}
