import type { JsonObject } from "./schema.ts";
export type AISearchPageType = "homepage" | "service" | "product" | "category" | "blog" | "article" | "landing" | "pricing" | "comparison" | "documentation" | "local" | "news" | "unknown";
export type DiscoverPageType = "blog" | "article" | "news" | "guide" | "video" | "homepage" | "unknown";
export type QueryIntent = "informational" | "commercial" | "transactional" | "navigational" | "local" | "comparison" | "pricing" | "product_led" | "support" | "conversational" | "unknown";
export type Priority = "P0" | "P1" | "P2" | "P3";
export type AISearchDiscoverStatus = "completed" | "partial" | "needs_input";
export interface AISearchAuditInput {
    url?: string;
    html?: string;
    page?: {
        url?: string;
        pageType?: AISearchPageType;
        title?: string;
        metaDescription?: string;
        h1?: string;
        bodyText?: string;
        canonicalUrl?: string;
        robots?: string;
        isIndexable?: boolean;
        allowsSnippets?: boolean;
        maxSnippet?: number;
        maxImagePreview?: "none" | "standard" | "large" | "unknown";
    };
    content?: {
        summary?: string;
        sections?: Array<{
            heading?: string;
            text?: string;
            type?: "definition" | "steps" | "comparison" | "faq" | "table" | "list" | "example" | "proof" | "case_study" | "unknown";
        }>;
        faqs?: Array<{
            question: string;
            answer: string;
        }>;
        tables?: Array<{
            caption?: string;
            headers?: string[];
            rows?: unknown[][];
        }>;
        answerBlocks?: Array<{
            question?: string;
            answer: string;
            position?: "above_fold" | "body" | "below_fold" | "unknown";
        }>;
        sources?: Array<{
            title?: string;
            url?: string;
            type?: "official" | "research" | "news" | "blog" | "forum" | "unknown";
        }>;
        originalInsights?: string[];
        examples?: string[];
        caseStudies?: string[];
    };
    entities?: Array<{
        name: string;
        type: "organization" | "person" | "product" | "service" | "software" | "location" | "topic" | "brand" | "unknown";
        description?: string;
        sameAs?: string[];
    }>;
    queries?: Array<{
        query: string;
        intent?: QueryIntent;
    }>;
    schema?: {
        jsonLd?: JsonObject[];
    };
    mode?: "audit" | "readiness" | "answer_block" | "content_quality" | "planning";
}
export interface DiscoverSEOAuditInput {
    url?: string;
    html?: string;
    page?: {
        url?: string;
        pageType?: DiscoverPageType;
        title?: string;
        headline?: string;
        description?: string;
        bodyText?: string;
        canonicalUrl?: string;
        isIndexable?: boolean;
        allowsSnippets?: boolean;
        maxImagePreview?: "none" | "standard" | "large" | "unknown";
        publishDate?: string;
        modifiedDate?: string;
    };
    publisher?: {
        name?: string;
        url?: string;
        logo?: string;
        author?: string;
        authorUrl?: string;
    };
    images?: Array<{
        src: string;
        width?: number;
        height?: number;
        alt?: string;
        position?: "hero" | "body" | "thumbnail" | "unknown";
    }>;
    openGraph?: {
        ogTitle?: string;
        ogDescription?: string;
        ogImage?: string;
        ogImageAlt?: string;
    };
    contentSignals?: {
        isTimely?: boolean;
        isEvergreen?: boolean;
        hasOriginalReporting?: boolean;
        hasExpertAuthor?: boolean;
        hasMisleadingTitleRisk?: boolean;
        hasClickbaitRisk?: boolean;
        hasShockingThumbnailRisk?: boolean;
    };
    mode?: "audit" | "discover" | "news" | "planning";
}
export interface AISearchDiscoverIssue {
    id: string;
    category: string;
    title: string;
    priority: Priority;
    problem: string;
    whyItMatters: string;
    howToFix: string;
    do: string[];
    dont: string[];
    evidence: string[];
    appliesTo: Array<"ai_search" | "discover" | "content" | "entity" | "audit">;
}
export interface AISearchDiscoverOutput {
    skill: "ai-search-discover-seo";
    status: AISearchDiscoverStatus;
    score: number;
    summary: string;
    aiSearchFindings: string[];
    answerBlockFindings: string[];
    entityFindings: string[];
    contentQualityFindings: string[];
    discoverFindings: string[];
    newsPublisherFindings: string[];
    issues: AISearchDiscoverIssue[];
    missingInputs: string[];
    nextActions: string[];
}
//# sourceMappingURL=ai-discover.d.ts.map