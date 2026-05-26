export const onPageLinkRules = [{
        id: "on-page-links-core",
        category: "on-page-links",
        title: "On-page internal links",
        description: "Links should be useful, descriptive, relevant, and crawlable.",
        do: ["Use descriptive internal link anchor text", "Link to related pages", "Link from page body, not only footer/nav", "Include useful external citations when needed"],
        dont: ["Use click here everywhere", "Add irrelevant links", "Link to broken or redirected internal URLs if known", "Overuse exact-match anchors"],
        priority: "P2",
        appliesTo: ["website", "page", "content", "on_page", "audit"],
        status: "active"
    }];
export function checkOnPageLinks(input) {
    const links = input.links ?? [];
    const issues = [];
    if (input.bodyText && !links.some((link) => link.type === "internal" || (link.type === "unknown" && link.href.startsWith("/"))))
        issues.push(issue("internal-links-missing", "No internal links found", "P2", "No internal links were provided or extracted.", "Add relevant body links to related pages."));
    const genericCount = links.filter((link) => /^(click here|read more|learn more|here)$/iu.test(link.text?.trim() ?? "")).length;
    if (genericCount >= Math.max(1, links.length))
        issues.push(issue("generic-anchor-text", "Generic anchor text overused", "P3", `${genericCount} generic anchors found.`, "Use descriptive anchors that explain destination value."));
    for (const link of links) {
        if (link.type === "external" && !link.text?.trim())
            issues.push(issue("external-link-missing-anchor", "External link missing anchor text", "P3", link.href, "Add descriptive anchor text."));
        if (/^javascript:/iu.test(link.href))
            issues.push(issue("javascript-link", "JavaScript link found", "P2", link.href, "Use a crawlable href for important links."));
    }
    return { issues, passedChecks: links.length && !issues.length ? ["On-page link checks passed."] : [] };
}
function issue(id, title, priority, evidence, howToFix) {
    return {
        id,
        category: "on-page-links",
        title,
        priority,
        problem: evidence,
        whyItMatters: "Internal links help discovery, relevance, and user paths.",
        howToFix,
        do: onPageLinkRules[0].do,
        dont: onPageLinkRules[0].dont,
        evidence: [evidence],
        appliesTo: ["page", "content", "on_page", "audit"]
    };
}
//# sourceMappingURL=on-page-links.js.map