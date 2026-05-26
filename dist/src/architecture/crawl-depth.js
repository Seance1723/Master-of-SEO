import { normalizeUrl, isHomepage } from "./url-utils.js";
export function calculateDepthIssues(input, graph) {
    const homepage = (input.pages ?? []).find((page) => page.pageType === "homepage")?.url ?? input.url ?? (input.pages ?? []).find((page) => isHomepage(page.url))?.url;
    if (!homepage)
        return [];
    const depths = new Map([[normalizeUrl(homepage), 0]]);
    const queue = [normalizeUrl(homepage)];
    while (queue.length) {
        const current = queue.shift();
        for (const link of graph.outgoing.get(current) ?? []) {
            if (!depths.has(link.to)) {
                depths.set(link.to, (depths.get(current) ?? 0) + 1);
                queue.push(link.to);
            }
        }
    }
    return (input.pages ?? []).flatMap((page) => {
        const depth = depths.get(normalizeUrl(page.url));
        if (depth === undefined)
            return [];
        if (page.importance === "critical" && depth > 3)
            return [issue("critical-page-too-deep", "Critical page is too deep", "P1", `${page.url} depth=${depth}`)];
        if (page.importance === "high" && depth > 4)
            return [issue("high-page-too-deep", "High-priority page is too deep", "P2", `${page.url} depth=${depth}`)];
        return [];
    });
}
function issue(id, title, priority, evidence) {
    return { id, category: "crawl-depth", title, priority, problem: evidence, whyItMatters: "Important pages buried deep receive weaker discovery and internal link signals.", howToFix: "Add links from homepage, navigation, hub, or high-authority pages.", do: ["Keep critical pages within 1-2 clicks where possible", "Use internal links to improve discovery"], dont: ["Bury service, product, pricing, or conversion pages", "Assume sitemap solves poor internal linking"], evidence: [evidence], appliesTo: ["architecture", "crawlability", "planning", "audit"] };
}
//# sourceMappingURL=crawl-depth.js.map