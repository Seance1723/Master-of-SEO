export type ReportingStatus = "completed" | "partial" | "needs_input";
export type ReportingPriority = "P0" | "P1" | "P2" | "P3";
export type ReportingMode = "report" | "measurement" | "governance" | "qa" | "release" | "final";
export interface ReportingGovernanceInput {
    business?: {
        name?: string;
        domain?: string;
        industry?: string;
        websiteType?: "saas" | "ecommerce" | "local_business" | "blog_news" | "corporate" | "portfolio" | "marketplace" | "documentation" | "landing_page" | "unknown";
        businessGoals?: string[];
    };
    websiteAudit?: {
        score?: number;
        grade?: "A" | "B" | "C" | "D" | "F";
        issues?: Record<string, unknown>[];
        criticalIssues?: Record<string, unknown>[];
        quickWins?: Record<string, unknown>[];
        strategicOpportunities?: Record<string, unknown>[];
        categoryScores?: Record<string, unknown>;
        roadmap?: Record<string, unknown>;
    };
    seoStrategy?: {
        seoGoals?: Record<string, unknown>[];
        priorityOpportunities?: Record<string, unknown>[];
        roadmap?: Record<string, unknown>;
        technicalPlan?: Record<string, unknown>[];
        contentPlan?: Record<string, unknown>[];
        authorityPlan?: Record<string, unknown>[];
        conversionPlan?: Record<string, unknown>[];
        risks?: Record<string, unknown>[];
    };
    searchConsole?: {
        dateRange?: string;
        clicks?: number;
        impressions?: number;
        ctr?: number;
        averagePosition?: number;
        pages?: Array<{
            url: string;
            clicks?: number;
            impressions?: number;
            ctr?: number;
            averagePosition?: number;
            queries?: string[];
        }>;
        queries?: Array<{
            query: string;
            clicks?: number;
            impressions?: number;
            ctr?: number;
            averagePosition?: number;
            url?: string;
        }>;
        indexing?: {
            indexedPages?: number;
            notIndexedPages?: number;
            coverageIssues?: Record<string, unknown>[];
        };
    };
    ga4?: {
        dateRange?: string;
        organicSessions?: number;
        organicUsers?: number;
        engagedSessions?: number;
        conversions?: number;
        conversionRate?: number;
        revenue?: number;
        events?: Array<{
            name: string;
            count?: number;
            isConversion?: boolean;
        }>;
        landingPages?: Array<{
            url: string;
            sessions?: number;
            conversions?: number;
            revenue?: number;
        }>;
    };
    rankTracking?: Array<{
        keyword: string;
        url?: string;
        rank?: number;
        previousRank?: number;
        intent?: string;
    }>;
    coreWebVitals?: {
        lcp?: number;
        inp?: number;
        cls?: number;
        pages?: Array<{
            url: string;
            lcp?: number;
            inp?: number;
            cls?: number;
            status?: "good" | "needs_improvement" | "poor" | "unknown";
        }>;
    };
    backlinks?: {
        totalBacklinks?: number;
        referringDomains?: number;
        newLinks?: number;
        lostLinks?: number;
        links?: Array<{
            sourceUrl: string;
            targetUrl?: string;
            anchorText?: string;
            linkType?: string;
            isSpam?: boolean;
        }>;
    };
    contentPerformance?: Array<{
        url: string;
        title?: string;
        clicks?: number;
        impressions?: number;
        sessions?: number;
        conversions?: number;
        previousClicks?: number;
        previousSessions?: number;
        lastUpdated?: string;
        contentType?: string;
    }>;
    governance?: {
        hasSeoQaProcess?: boolean;
        hasReleaseChecklist?: boolean;
        hasRedirectPolicy?: boolean;
        hasContentUpdateProcess?: boolean;
        hasAnalyticsReviewCadence?: boolean;
        hasSeoChangelog?: boolean;
        lastReleaseDate?: string;
        pendingChanges?: Array<{
            type: "url_change" | "template_change" | "content_change" | "metadata_change" | "robots_change" | "sitemap_change" | "migration" | "redesign" | "unknown";
            description?: string;
            riskLevel?: "low" | "medium" | "high" | "unknown";
        }>;
    };
    mode?: ReportingMode;
}
export interface ReportingIssue {
    id: string;
    category: string;
    title: string;
    priority: ReportingPriority;
    problem: string;
    whyItMatters: string;
    howToFix: string;
    do: string[];
    dont: string[];
    evidence: string[];
    appliesTo: Array<"measurement" | "reporting" | "governance" | "qa" | "release" | "final">;
}
export interface ReportingGovernanceOutput {
    skill: "measurement-reporting-governance";
    status: ReportingStatus;
    score: number;
    summary: string;
    executiveSummary: string;
    kpis: unknown[];
    searchConsoleFindings: unknown[];
    ga4Findings: unknown[];
    conversionFindings: unknown[];
    keywordFindings: unknown[];
    contentDecayFindings: unknown[];
    coreWebVitalsFindings: unknown[];
    backlinkFindings: unknown[];
    revenueFindings: unknown[];
    governanceFindings: unknown[];
    qaChecklist: unknown[];
    releaseRiskFindings: unknown[];
    roadmapProgress: unknown[];
    finalReport: Record<string, unknown>;
    issues: ReportingIssue[];
    missingInputs: string[];
    nextActions: string[];
}
//# sourceMappingURL=reporting-governance.d.ts.map