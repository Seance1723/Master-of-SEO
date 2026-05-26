import { makeContentItem, pageTypeForCluster } from "./content-brief.js";
export function planSupportingContent(clusters, pillars) {
    return clusters.filter((cluster) => ["informational", "comparison", "support"].includes(cluster.intent ?? "") || /\b(how|what|why|guide|tips|vs|help)\b/iu.test(cluster.primaryKeyword)).map((cluster, index) => {
        const item = makeContentItem(cluster, "supporting", index + 1, pageTypeForCluster(cluster), cluster.funnelStage === "tofu" ? "P3" : "P2");
        const relatedPillar = pillars[0];
        if (relatedPillar)
            item.internalLinksToAdd.push(`${item.title} -> ${relatedPillar.title}`, `${relatedPillar.title} -> ${item.title}`);
        return item;
    });
}
//# sourceMappingURL=supporting-content.js.map