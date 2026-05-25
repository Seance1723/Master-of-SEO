import type { ArchitectureAuditInput, ArchitectureIssue } from "../types/architecture.ts";
import { normalizeUrl } from "./url-utils.ts";

export function checkTopicClusterLinking(input: ArchitectureAuditInput): ArchitectureIssue[] {
  const issues: ArchitectureIssue[] = [];
  const links = (input.links ?? []).map((link) => ({ from: normalizeUrl(link.from), to: normalizeUrl(link.to) }));
  for (const cluster of input.topicClusters ?? []) {
    if (!cluster.pillarUrl) { issues.push(issue("topic-cluster-missing-pillar", "Topic cluster missing pillar page", "P1", cluster.clusterName)); continue; }
    const pillar = normalizeUrl(cluster.pillarUrl);
    for (const support of cluster.supportingUrls ?? []) {
      const normalizedSupport = normalizeUrl(support);
      if (!links.some((link) => link.from === normalizedSupport && link.to === pillar)) issues.push(issue("support-not-linking-pillar", "Supporting page does not link to pillar", "P2", `${support} -> ${cluster.pillarUrl}`));
      if (!links.some((link) => link.from === pillar && link.to === normalizedSupport)) issues.push(issue("pillar-not-linking-support", "Pillar does not link to supporting page", "P2", `${cluster.pillarUrl} -> ${support}`));
    }
    if ((cluster.supportingUrls ?? []).length > 1) {
      const supportSet = (cluster.supportingUrls ?? []).map(normalizeUrl);
      if (!links.some((link) => supportSet.includes(link.from) && supportSet.includes(link.to) && link.from !== link.to)) issues.push(issue("supporting-pages-isolated", "Supporting pages are isolated from each other", "P3", cluster.clusterName));
    }
  }
  return issues;
}

function issue(id: string, title: string, priority: ArchitectureIssue["priority"], evidence: string): ArchitectureIssue {
  return { id, category: "topic-cluster-linking", title, priority, problem: evidence, whyItMatters: "Topic clusters need reciprocal and contextual links to reinforce topical authority.", howToFix: "Connect pillar, supporting, related, and commercial pages with relevant links.", do: ["Connect pillar pages and supporting pages", "Link supporting pages back to pillar pages", "Connect cluster pages to commercial pages"], dont: ["Create topic clusters without links", "Let supporting pages compete with pillar pages"], evidence: [evidence], appliesTo: ["architecture", "internal_linking", "planning", "audit"] };
}
