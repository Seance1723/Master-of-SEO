import type { PriorityLabel } from "./index.ts";
import type { FunnelStage, KeywordIntent, KeywordPageType } from "./keywords.ts";
export interface ContentBusiness {
    name?: string;
    industry?: string;
    websiteType?: "saas" | "ecommerce" | "local_business" | "blog_news" | "corporate" | "portfolio" | "marketplace" | "documentation" | "landing_page" | "unknown";
    targetAudience?: string;
    services?: string[];
    products?: string[];
    locations?: string[];
    goals?: Array<"lead_generation" | "sales" | "demo_booking" | "signup" | "brand_awareness" | "content_traffic" | "local_visits" | "support" | "unknown">;
}
export interface ContentKeywordCluster {
    clusterName: string;
    primaryKeyword: string;
    secondaryKeywords?: string[];
    intent?: KeywordIntent;
    funnelStage?: FunnelStage;
    recommendedPageType?: KeywordPageType;
    businessValue?: "high" | "medium" | "low" | "unknown";
    difficultyLevel?: "easy" | "medium" | "hard" | "unknown";
}
export interface ContentExistingPage {
    url: string;
    title?: string;
    h1?: string;
    pageType?: KeywordPageType;
    targetKeyword?: string;
    rankingKeywords?: string[];
    traffic?: number;
    conversions?: number;
    lastUpdated?: string;
    wordCount?: number;
    status?: "live" | "draft" | "outdated" | "thin" | "duplicate" | "unknown";
}
export interface ContentCompetitorPage {
    url: string;
    title?: string;
    pageType?: string;
    targetKeyword?: string;
    notes?: string[];
}
export interface ContentPlanInput {
    business?: ContentBusiness;
    keywordClusters?: ContentKeywordCluster[];
    existingPages?: ContentExistingPage[];
    competitorPages?: ContentCompetitorPage[];
    constraints?: {
        monthlyContentCapacity?: number;
        priority?: "traffic" | "leads" | "sales" | "authority" | "refresh" | "balanced";
        tone?: "professional" | "simple" | "technical" | "beginner_friendly" | "enterprise" | "unknown";
    };
    mode: "planning" | "brief" | "refresh" | "pruning" | "calendar" | "audit";
}
export interface ContentItem {
    contentId: string;
    title: string;
    targetKeyword: string;
    secondaryKeywords: string[];
    intent: KeywordIntent | "unknown";
    funnelStage: FunnelStage | "unknown";
    recommendedPageType: KeywordPageType;
    suggestedUrl: string;
    h1: string;
    h2Outline: string[];
    mustCoverSections: string[];
    faqs: string[];
    internalLinksToAdd: string[];
    ctaRecommendation: string;
    schemaRecommendation: string;
    qualityNotes: string[];
    successMetric: string;
    priority: PriorityLabel;
}
export interface ContentIssue {
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
    appliesTo: Array<"content" | "planning" | "audit" | "strategy">;
}
export interface ContentGap {
    id: string;
    type: "keyword_gap" | "competitor_gap" | "support_gap" | "bofu_gap";
    keyword: string;
    priority: PriorityLabel;
    reason: string;
}
export interface ContentRefreshItem {
    url: string;
    reason: string;
    priority: PriorityLabel;
    recommendedActions: string[];
    expectedImpact: string;
}
export interface ContentPruningItem {
    url: string;
    reason: string;
    priority: PriorityLabel;
    action: "improve" | "merge" | "redirect" | "canonicalize" | "noindex" | "delete";
}
export interface ContentCalendarItem {
    window: "30_days" | "60_days" | "90_days";
    title: string;
    type: "pillar" | "supporting" | "refresh" | "pruning";
    priority: PriorityLabel;
    owner: "unassigned";
    status: "planned";
}
export interface ContentPlanOutput {
    skill: "content-strategy-planning";
    status: "completed" | "partial" | "needs_input";
    score: number;
    summary: string;
    pillarPages: ContentItem[];
    supportingPages: ContentItem[];
    contentBriefs: ContentItem[];
    contentGaps: ContentGap[];
    refreshPlan: ContentRefreshItem[];
    pruningPlan: ContentPruningItem[];
    contentCalendar: ContentCalendarItem[];
    issues: ContentIssue[];
    missingInputs: string[];
    nextActions: string[];
}
export interface ContentRule {
    id: string;
    category: string;
    title: string;
    description: string;
    do: string[];
    dont: string[];
    priority: PriorityLabel;
    appliesTo: Array<"content" | "planning" | "audit" | "strategy">;
    status: "active" | "planned";
}
//# sourceMappingURL=content.d.ts.map