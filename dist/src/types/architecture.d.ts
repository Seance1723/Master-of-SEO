import type { PriorityLabel } from "./index.ts";
import type { FunnelStage, KeywordIntent, KeywordPageType } from "./keywords.ts";
export interface ArchitecturePage {
    url: string;
    title?: string;
    pageType?: KeywordPageType | "contact" | "about";
    targetKeyword?: string;
    intent?: KeywordIntent;
    funnelStage?: FunnelStage;
    importance?: "critical" | "high" | "medium" | "low" | "unknown";
    status?: "live" | "draft" | "outdated" | "thin" | "duplicate" | "unknown";
}
export interface ArchitectureLink {
    from: string;
    to: string;
    anchorText?: string;
    linkType?: "navigation" | "footer" | "breadcrumb" | "contextual" | "related" | "sidebar" | "unknown";
    isFollowed?: boolean;
}
export interface NavigationItem {
    label: string;
    url: string;
    level?: number;
}
export interface BreadcrumbTrail {
    pageUrl: string;
    items: Array<{
        label: string;
        url?: string;
        position?: number;
    }>;
}
export interface TopicClusterLinkInput {
    clusterName: string;
    pillarUrl?: string;
    supportingUrls?: string[];
    primaryKeyword?: string;
}
export interface ArchitectureAuditInput {
    url?: string;
    pages?: ArchitecturePage[];
    links?: ArchitectureLink[];
    navigation?: NavigationItem[];
    breadcrumbs?: BreadcrumbTrail[];
    sitemapUrls?: string[];
    topicClusters?: TopicClusterLinkInput[];
    mode: "audit" | "planning" | "linking" | "architecture";
}
export interface ArchitectureIssue {
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
    appliesTo: Array<"architecture" | "internal_linking" | "crawlability" | "planning" | "audit">;
}
export interface ArchitectureAuditOutput {
    skill: "site-architecture-internal-linking";
    status: "completed" | "partial" | "needs_input";
    score: number;
    summary: string;
    architectureFindings: string[];
    internalLinkingFindings: string[];
    orphanPages: string[];
    crawlDepthIssues: ArchitectureIssue[];
    anchorTextIssues: ArchitectureIssue[];
    breadcrumbIssues: ArchitectureIssue[];
    topicClusterLinkingIssues: ArchitectureIssue[];
    recommendations: string[];
    issues: ArchitectureIssue[];
    missingInputs: string[];
    nextActions: string[];
}
export interface ArchitectureRule {
    id: string;
    category: string;
    title: string;
    description: string;
    do: string[];
    dont: string[];
    priority: PriorityLabel;
    appliesTo: Array<"architecture" | "internal_linking" | "crawlability" | "planning" | "audit">;
    status: "active" | "planned";
}
//# sourceMappingURL=architecture.d.ts.map