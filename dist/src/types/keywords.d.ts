import type { PriorityLabel } from "./index.ts";
export type KeywordIntent = "informational" | "commercial" | "transactional" | "navigational" | "local" | "comparison" | "pricing" | "product_led" | "support" | "unknown";
export type FunnelStage = "tofu" | "mofu" | "bofu" | "retention" | "unknown";
export type KeywordPageType = "homepage" | "service" | "product" | "category" | "blog" | "landing" | "pricing" | "comparison" | "documentation" | "local" | "contact" | "about" | "unknown";
export interface ExistingKeywordPage {
    url: string;
    title?: string;
    h1?: string;
    targetKeyword?: string;
    rankingKeywords?: string[];
    pageType?: KeywordPageType;
}
export interface KeywordBusinessContext {
    name?: string;
    industry?: string;
    websiteType?: "saas" | "ecommerce" | "local_business" | "blog_news" | "corporate" | "portfolio" | "marketplace" | "documentation" | "landing_page" | "unknown";
    targetAudience?: string;
    services?: string[];
    products?: string[];
    locations?: string[];
    goals?: Array<"lead_generation" | "sales" | "demo_booking" | "signup" | "brand_awareness" | "content_traffic" | "local_visits" | "support" | "unknown">;
}
export interface KeywordMetric {
    keyword: string;
    volume?: number;
    difficulty?: number;
    cpc?: number;
    currentRank?: number;
    competitorRank?: number;
}
export interface KeywordResearchInput {
    seedKeywords?: string[];
    competitorKeywords?: string[];
    existingPages?: ExistingKeywordPage[];
    business?: KeywordBusinessContext;
    keywordMetrics?: KeywordMetric[];
    mode: "research" | "clustering" | "mapping" | "planning" | "audit";
}
export interface KeywordCluster {
    clusterId: string;
    clusterName: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    intent: KeywordIntent;
    funnelStage: FunnelStage;
    recommendedPageType: KeywordPageType;
    priority: PriorityLabel;
    businessValue: "high" | "medium" | "low" | "unknown";
    difficultyLevel: "easy" | "medium" | "hard" | "unknown";
    targetUrl?: string;
    notes: string[];
}
export interface KeywordIssue {
    id: string;
    category: string;
    title: string;
    priority: PriorityLabel;
    problem: string;
    whyItMatters: string;
    howToFix: string;
    do: string[];
    dont: string[];
    evidence: string[];
    appliesTo: Array<"keyword" | "content" | "planning" | "audit">;
}
export interface KeywordMapItem {
    keyword: string;
    intent: KeywordIntent;
    recommendedPageType: KeywordPageType;
    targetUrl?: string;
    action: "update_existing" | "create_new" | "review";
}
export interface CannibalizationRisk {
    keyword: string;
    urls: string[];
    recommendation: "merge" | "redirect" | "canonicalize" | "reposition" | "keep_separate";
    reason: string;
}
export interface KeywordOpportunity {
    keyword: string;
    type: "quick_win" | "bofu_gap" | "competitor_gap" | "mapping_gap" | "content_refresh";
    priority: PriorityLabel;
    reason: string;
}
export interface KeywordResearchOutput {
    skill: "keyword-research-intent";
    status: "completed" | "partial" | "needs_input";
    score: number;
    summary: string;
    clusters: KeywordCluster[];
    issues: KeywordIssue[];
    keywordMap: KeywordMapItem[];
    cannibalizationRisks: CannibalizationRisk[];
    opportunities: KeywordOpportunity[];
    missingInputs: string[];
    nextActions: string[];
}
export interface KeywordRule {
    id: string;
    category: string;
    title: string;
    description: string;
    do: string[];
    dont: string[];
    priority: PriorityLabel;
    appliesTo: Array<"keyword" | "content" | "planning" | "audit">;
    status: "active" | "planned";
}
//# sourceMappingURL=keywords.d.ts.map