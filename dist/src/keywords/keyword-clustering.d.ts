import type { KeywordBusinessContext, KeywordCluster, KeywordMetric } from "../types/keywords.ts";
export interface NormalizedKeyword {
    display: string;
    normalized: string;
    source: "seed" | "competitor" | "metric";
}
export declare function normalizeKeywords(keywords: string[]): NormalizedKeyword[];
export declare function clusterKeywords(keywords: NormalizedKeyword[], metrics: KeywordMetric[], business?: KeywordBusinessContext): KeywordCluster[];
//# sourceMappingURL=keyword-clustering.d.ts.map