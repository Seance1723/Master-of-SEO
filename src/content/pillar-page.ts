import type { ContentItem, ContentKeywordCluster } from "../types/content.ts";
import { makeContentItem, pageTypeForCluster } from "./content-brief.ts";

export function planPillarPages(clusters: ContentKeywordCluster[]): ContentItem[] {
  return clusters.filter((cluster) => ["commercial", "product_led", "transactional", "pricing", "local"].includes(cluster.intent ?? "") || cluster.businessValue === "high").map((cluster, index) => makeContentItem(cluster, "pillar", index + 1, pageTypeForCluster(cluster), "P1"));
}
