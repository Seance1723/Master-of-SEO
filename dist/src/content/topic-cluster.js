export function dedupeClusters(clusters = []) {
    const seen = new Set();
    return clusters.filter((cluster) => {
        const key = `${cluster.primaryKeyword.trim().toLowerCase()}:${cluster.intent ?? "unknown"}`;
        if (!cluster.primaryKeyword.trim() || seen.has(key))
            return false;
        seen.add(key);
        return true;
    }).map((cluster) => ({
        ...cluster,
        clusterName: cluster.clusterName || cluster.primaryKeyword,
        intent: cluster.intent ?? "unknown",
        funnelStage: cluster.funnelStage ?? "unknown",
        recommendedPageType: cluster.recommendedPageType ?? "unknown",
        businessValue: cluster.businessValue ?? "unknown",
        difficultyLevel: cluster.difficultyLevel ?? "unknown"
    }));
}
//# sourceMappingURL=topic-cluster.js.map