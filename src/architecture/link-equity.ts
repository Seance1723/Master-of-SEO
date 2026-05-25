import type { ArchitectureAuditInput } from "../types/architecture.ts";
import type { LinkGraph } from "./internal-linking.ts";
import { normalizeUrl } from "./url-utils.ts";

export function recommendLinkEquity(input: ArchitectureAuditInput, graph: LinkGraph): string[] {
  const recommendations: string[] = [];
  const strongPages = (input.pages ?? []).filter((page) => (graph.incoming.get(normalizeUrl(page.url)) ?? []).length >= 3);
  const importantWeak = (input.pages ?? []).filter((page) => ["critical", "high"].includes(page.importance ?? "") && (graph.incoming.get(normalizeUrl(page.url)) ?? []).length < 3);
  if (strongPages.length && importantWeak.length) recommendations.push(`Add contextual links from ${strongPages[0].url} to ${importantWeak[0].url}.`);
  const lowOverlinked = (input.pages ?? []).find((page) => page.importance === "low" && (graph.incoming.get(normalizeUrl(page.url)) ?? []).length > 10);
  if (lowOverlinked) recommendations.push(`Review excessive internal links to low-value page ${lowOverlinked.url}.`);
  return recommendations;
}
