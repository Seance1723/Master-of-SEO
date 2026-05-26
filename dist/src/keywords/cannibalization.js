export function detectCannibalization(pages = [], clusters = []) {
    const risks = [];
    const targetMap = new Map();
    for (const page of pages) {
        if (page.targetKeyword)
            targetMap.set(page.targetKeyword.toLowerCase(), [...(targetMap.get(page.targetKeyword.toLowerCase()) ?? []), page.url]);
        for (const keyword of page.rankingKeywords ?? [])
            targetMap.set(keyword.toLowerCase(), [...(targetMap.get(keyword.toLowerCase()) ?? []), page.url]);
    }
    for (const [keyword, urls] of targetMap.entries()) {
        const uniqueUrls = [...new Set(urls)];
        if (uniqueUrls.length > 1)
            risks.push({ keyword, urls: uniqueUrls, recommendation: "reposition", reason: "Multiple existing pages target or rank for the same keyword." });
    }
    const byUrl = new Map();
    for (const cluster of clusters.filter((item) => item.targetUrl))
        byUrl.set(cluster.targetUrl, [...(byUrl.get(cluster.targetUrl) ?? []), cluster]);
    for (const [url, mapped] of byUrl.entries()) {
        const intents = new Set(mapped.map((cluster) => cluster.intent));
        if (intents.size > 1)
            risks.push({ keyword: mapped.map((cluster) => cluster.primaryKeyword).join(", "), urls: [url], recommendation: "keep_separate", reason: "Multiple conflicting intents mapped to the same URL." });
    }
    return risks;
}
//# sourceMappingURL=cannibalization.js.map