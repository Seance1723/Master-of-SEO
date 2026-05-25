import type { ContentItem, ContentKeywordCluster } from "../types/content.ts";
import { makeContentItem, pageTypeForCluster } from "./content-brief.ts";

export function planSupportingContent(clusters: ContentKeywordCluster[], pillars: ContentItem[]): ContentItem[] {
  return clusters.filter((cluster) => ["informational", "comparison", "support"].includes(cluster.intent ?? "") || /\b(how|what|why|guide|tips|vs|help)\b/iu.test(cluster.primaryKeyword)).map((cluster, index) => {
    const item = makeContentItem(cluster, "supporting", index + 1, pageTypeForCluster(cluster), cluster.funnelStage === "tofu" ? "P3" : "P2");
    const relatedPillar = pillars[0];
    if (relatedPillar) item.internalLinksToAdd.push(`${item.title} -> ${relatedPillar.title}`, `${relatedPillar.title} -> ${item.title}`);
    return item;
  });
}
