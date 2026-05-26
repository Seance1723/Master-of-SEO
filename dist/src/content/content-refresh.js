export function planContentRefresh(pages = []) {
    return pages.flatMap((page) => {
        const reasons = [];
        if (page.status === "outdated" || page.status === "thin")
            reasons.push(`status is ${page.status}`);
        if ((page.wordCount ?? 9999) < 300 && ["service", "product", "landing", "pricing"].includes(page.pageType ?? ""))
            reasons.push("important page has under 300 words");
        if (page.lastUpdated && olderThan12Months(page.lastUpdated))
            reasons.push("lastUpdated is older than 12 months");
        if ((page.traffic ?? 0) > 0 && (page.conversions ?? 1) === 0)
            reasons.push("traffic exists but conversions are zero");
        if ((page.rankingKeywords?.length ?? 0) > 0 && (!page.targetKeyword || !page.title || !page.h1))
            reasons.push("rankings exist but target/title/H1 data is weak");
        if (!reasons.length)
            return [];
        return [{ url: page.url, reason: reasons.join("; "), priority: page.status === "thin" ? "P1" : "P2", recommendedActions: ["Update facts/examples", "Add missing sections", "Improve title/H1", "Update internal links"], expectedImpact: "Improved relevance, freshness, and conversion support" }];
    });
}
function olderThan12Months(value) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) && Date.now() - date.getTime() > 365 * 24 * 60 * 60 * 1000;
}
//# sourceMappingURL=content-refresh.js.map