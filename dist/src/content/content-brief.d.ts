import type { ContentItem, ContentKeywordCluster } from "../types/content.ts";
import type { KeywordPageType } from "../types/keywords.ts";
export declare function pageTypeForCluster(cluster: ContentKeywordCluster): KeywordPageType;
export declare function makeContentItem(cluster: ContentKeywordCluster, kind: "pillar" | "supporting", index: number, pageType: KeywordPageType, priority: ContentItem["priority"]): ContentItem;
//# sourceMappingURL=content-brief.d.ts.map