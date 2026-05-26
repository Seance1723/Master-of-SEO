export function mapClustersToPages(clusters, pages = []) {
    return clusters.map((cluster) => {
        const match = pages.find((page) => pageMatchesCluster(page, cluster));
        if (match)
            cluster.targetUrl = match.url;
        return {
            keyword: cluster.primaryKeyword,
            intent: cluster.intent,
            recommendedPageType: cluster.recommendedPageType,
            targetUrl: match?.url,
            action: match ? "update_existing" : "create_new"
        };
    });
}
function pageMatchesCluster(page, cluster) {
    const haystack = [page.targetKeyword, page.title, page.h1, page.url, ...(page.rankingKeywords ?? [])].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(cluster.primaryKeyword.toLowerCase()) || Boolean(page.pageType && page.pageType === cluster.recommendedPageType);
}
//# sourceMappingURL=keyword-page-map.js.map