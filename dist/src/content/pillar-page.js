import { makeContentItem, pageTypeForCluster } from "./content-brief.js";
export function planPillarPages(clusters) {
    return clusters.filter((cluster) => ["commercial", "product_led", "transactional", "pricing", "local"].includes(cluster.intent ?? "") || cluster.businessValue === "high").map((cluster, index) => makeContentItem(cluster, "pillar", index + 1, pageTypeForCluster(cluster), "P1"));
}
//# sourceMappingURL=pillar-page.js.map