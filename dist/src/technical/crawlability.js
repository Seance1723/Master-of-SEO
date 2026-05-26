export const crawlabilityRules = [
    {
        id: "crawlability-links",
        category: "crawlability",
        title: "Crawlable internal links",
        description: "Important pages should be discoverable through real anchor links.",
        do: ["Use real <a href=\"\"> links", "Make important pages internally linked", "Avoid orphan pages", "Keep key pages within reasonable click depth"],
        dont: ["Rely only on JavaScript click handlers", "Block important CSS/JS/images", "Create infinite crawl traps", "Allow internal search pages to flood crawl paths"],
        priority: "P1",
        appliesTo: ["website", "page", "technical", "audit"],
        status: "active"
    }
];
export function checkCrawlability(input) {
    const issues = [];
    const passedChecks = [];
    const html = input.html;
    if (!html)
        return { issues, passedChecks };
    if (!/<a\s+[^>]*href\s*=/iu.test(html)) {
        issues.push({
            id: "crawlability-no-anchor-links",
            category: "crawlability",
            title: "No crawlable anchor links found",
            priority: "P2",
            problem: "Provided HTML does not contain any <a href> links.",
            whyItMatters: "Search engines discover pages primarily through crawlable links.",
            howToFix: "Use real anchor links for important navigation and internal links.",
            do: crawlabilityRules[0].do,
            dont: crawlabilityRules[0].dont,
            evidence: ["No <a href> pattern found in provided HTML"],
            appliesTo: ["page", "technical", "audit"]
        });
    }
    else {
        passedChecks.push("HTML contains crawlable anchor links.");
    }
    if (/href\s*=\s*["']javascript:/iu.test(html)) {
        issues.push({
            id: "crawlability-javascript-links",
            category: "crawlability",
            title: "JavaScript links found",
            priority: "P2",
            problem: "Provided HTML includes javascript: link targets.",
            whyItMatters: "JavaScript-only links can reduce crawler discovery and reliability.",
            howToFix: "Replace critical JavaScript links with standard <a href> URLs.",
            do: crawlabilityRules[0].do,
            dont: crawlabilityRules[0].dont,
            evidence: ["javascript: link target found"],
            appliesTo: ["page", "technical", "audit"]
        });
    }
    if (/<button[^>]*>[^<]*(menu|nav|next|category|link)/iu.test(html) && !/<nav[\s>]/iu.test(html)) {
        issues.push({
            id: "crawlability-button-navigation",
            category: "crawlability",
            title: "Possible button-only navigation",
            priority: "P3",
            problem: "Provided HTML suggests navigation may rely on buttons without obvious nav anchors.",
            whyItMatters: "Critical navigation should be available through crawlable links.",
            howToFix: "Expose important navigation as anchor links.",
            do: crawlabilityRules[0].do,
            dont: crawlabilityRules[0].dont,
            evidence: ["Navigation-like button text found"],
            appliesTo: ["page", "technical", "audit"]
        });
    }
    return { issues, passedChecks };
}
//# sourceMappingURL=crawlability.js.map