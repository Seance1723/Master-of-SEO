export const sitemapRules = [
    {
        id: "sitemap-core",
        category: "xml sitemap",
        title: "XML sitemap quality",
        description: "Sitemaps should list canonical, indexable, 200-status URLs.",
        do: ["Include only canonical indexable 200 URLs", "Split sitemaps by type where needed", "Use correct lastmod only when content changes"],
        dont: ["Include redirected URLs", "Include 404/410 URLs", "Include noindex URLs", "Fake lastmod", "Use sitemap as replacement for internal linking"],
        priority: "P1",
        appliesTo: ["website", "technical", "audit"],
        status: "active"
    }
];
export function checkSitemap(input) {
    const issues = [];
    const passedChecks = [];
    const xml = input.sitemapXml?.trim();
    if (!xml)
        return { issues, passedChecks };
    if (!xml.startsWith("<") || !/<(urlset|sitemapindex)\b/iu.test(xml)) {
        issues.push(issue("sitemap-invalid-root", "Invalid sitemap root", "Provided sitemap XML does not contain urlset or sitemapindex.", ["Missing <urlset> or <sitemapindex>"]));
    }
    else {
        passedChecks.push("Sitemap has a urlset or sitemapindex root.");
    }
    if (/<urlset\b/iu.test(xml) && !/<url>\s*<loc>[\s\S]+?<\/loc>[\s\S]*?<\/url>/iu.test(xml)) {
        issues.push(issue("sitemap-empty-urlset", "Empty sitemap urlset", "Provided sitemap urlset does not include URL entries.", ["No <url><loc> entries found"], "P2"));
    }
    for (const page of input.pages ?? []) {
        if (page.url && (page.redirected || (page.statusCode && page.statusCode >= 300 && page.statusCode < 400)) && xml.includes(page.url)) {
            issues.push(issue("sitemap-redirected-url", "Sitemap includes redirected URL", "Provided page data says a sitemap URL redirects.", [page.url]));
        }
        if (page.url && page.noindex && xml.includes(page.url)) {
            issues.push(issue("sitemap-noindex-url", "Sitemap includes noindex URL", "Provided page data says a sitemap URL is noindexed.", [page.url]));
        }
    }
    return { issues, passedChecks };
}
function issue(id, title, problem, evidence, priority = "P1") {
    return {
        id,
        category: "xml sitemap",
        title,
        priority,
        problem,
        whyItMatters: "Sitemap errors can send mixed crawl and indexation signals.",
        howToFix: "Include only canonical, indexable, 200-status URLs in valid sitemap XML.",
        do: sitemapRules[0].do,
        dont: sitemapRules[0].dont,
        evidence,
        appliesTo: ["website", "technical", "audit"]
    };
}
//# sourceMappingURL=sitemap.js.map