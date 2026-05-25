import type { ArchitectureAuditInput, ArchitectureLink } from "../types/architecture.ts";
import { normalizeUrl } from "./url-utils.ts";

export interface LinkGraph {
  incoming: Map<string, ArchitectureLink[]>;
  outgoing: Map<string, ArchitectureLink[]>;
  distribution: Record<string, number>;
}

export function buildLinkGraph(input: ArchitectureAuditInput): LinkGraph {
  const incoming = new Map<string, ArchitectureLink[]>();
  const outgoing = new Map<string, ArchitectureLink[]>();
  const distribution: Record<string, number> = {};
  for (const link of input.links ?? []) {
    const from = normalizeUrl(link.from);
    const to = normalizeUrl(link.to);
    const normalizedLink = { ...link, from, to };
    incoming.set(to, [...(incoming.get(to) ?? []), normalizedLink]);
    outgoing.set(from, [...(outgoing.get(from) ?? []), normalizedLink]);
    const type = link.linkType ?? "unknown";
    distribution[type] = (distribution[type] ?? 0) + 1;
  }
  return { incoming, outgoing, distribution };
}
