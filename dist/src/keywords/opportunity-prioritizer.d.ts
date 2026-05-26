import type { KeywordBusinessContext, KeywordCluster, KeywordIntent, KeywordMetric, KeywordOpportunity, KeywordPageType } from "../types/keywords.ts";
export declare function recommendPageType(intent: KeywordIntent, business?: KeywordBusinessContext): KeywordPageType;
export declare function scoreBusinessValue(keyword: string, intent: KeywordIntent, business?: KeywordBusinessContext): "high" | "medium" | "low" | "unknown";
export declare function findOpportunities(clusters: KeywordCluster[], metrics: KeywordMetric[], competitorKeywords: string[]): KeywordOpportunity[];
//# sourceMappingURL=opportunity-prioritizer.d.ts.map