import { normalizeUrl } from "./url-utils.js";
export function buildLinkGraph(input) {
    const incoming = new Map();
    const outgoing = new Map();
    const distribution = {};
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
//# sourceMappingURL=internal-linking.js.map