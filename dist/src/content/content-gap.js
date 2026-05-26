export function findContentGaps(clusters, pages = [], competitors = [], business) {
    const gaps = [];
    for (const cluster of clusters) {
        const match = pages.some((page) => [page.targetKeyword, page.title, page.h1, ...(page.rankingKeywords ?? [])].filter(Boolean).join(" ").toLowerCase().includes(cluster.primaryKeyword.toLowerCase()));
        if (!match)
            gaps.push({ id: `gap-${gaps.length + 1}`, type: cluster.funnelStage === "bofu" ? "bofu_gap" : "keyword_gap", keyword: cluster.primaryKeyword, priority: cluster.funnelStage === "bofu" || cluster.businessValue === "high" ? "P1" : "P2", reason: "Keyword cluster has no matching existing page." });
    }
    for (const competitor of competitors) {
        if (competitor.targetKeyword && !pages.some((page) => page.targetKeyword?.toLowerCase() === competitor.targetKeyword?.toLowerCase()))
            gaps.push({ id: `gap-${gaps.length + 1}`, type: "competitor_gap", keyword: competitor.targetKeyword, priority: "P2", reason: "Competitor page target keyword has no matching page." });
    }
    for (const term of [...(business?.services ?? []), ...(business?.products ?? [])]) {
        if (!clusters.some((cluster) => cluster.primaryKeyword.toLowerCase().includes(term.toLowerCase())))
            gaps.push({ id: `gap-${gaps.length + 1}`, type: "support_gap", keyword: term, priority: "P2", reason: "Existing service/product lacks matching supporting content cluster." });
    }
    return gaps;
}
//# sourceMappingURL=content-gap.js.map