import { normalizeUrl, isHomepage } from "./url-utils.js";
const doRules = ["Identify pages with no internal links", "Link valuable orphan pages from relevant pages", "Compare sitemap URLs with internal link graph"];
const dontRules = ["Leave important pages orphaned", "Rely only on XML sitemap for discovery", "Link orphan pages randomly without context"];
export function detectOrphanPages(input, graph) {
    const issues = [];
    const orphanPages = [];
    for (const page of input.pages ?? []) {
        const url = normalizeUrl(page.url);
        if (isHomepage(url))
            continue;
        if ((graph.incoming.get(url) ?? []).length === 0) {
            orphanPages.push(page.url);
            issues.push(issue("orphan-page", "Orphan page detected", page.importance === "critical" || page.importance === "high" ? "P1" : page.importance === "low" ? "P3" : "P2", page.url));
        }
    }
    const known = new Set([...(input.pages ?? []).map((page) => normalizeUrl(page.url)), ...(input.links ?? []).flatMap((link) => [normalizeUrl(link.from), normalizeUrl(link.to)])]);
    for (const sitemapUrl of input.sitemapUrls ?? [])
        if (!known.has(normalizeUrl(sitemapUrl)))
            issues.push(issue("sitemap-only-url", "Sitemap-only URL found", "P2", sitemapUrl));
    return { orphanPages, issues };
}
function issue(id, title, priority, evidence) {
    return { id, category: "orphan-pages", title, priority, problem: evidence, whyItMatters: "Pages with no internal links are harder to discover and pass signals to.", howToFix: "Add relevant contextual, hub, navigation, or related links if the page is valuable; otherwise prune safely.", do: doRules, dont: dontRules, evidence: [evidence], appliesTo: ["architecture", "internal_linking", "crawlability", "audit"] };
}
//# sourceMappingURL=orphan-pages.js.map