import type { PriorityLabel } from "./index.ts";
import type { JsonObject } from "./schema.ts";
export type MediaPageType = "homepage" | "service" | "product" | "category" | "blog" | "article" | "landing" | "pricing" | "comparison" | "documentation" | "local" | "video" | "contact" | "about" | "unknown";
export type MediaMode = "audit" | "image" | "video" | "planning";
export interface MediaImageInput {
    src: string;
    alt?: string;
    filename?: string;
    format?: "jpg" | "jpeg" | "png" | "webp" | "avif" | "svg" | "gif" | "unknown";
    sizeKb?: number;
    width?: number;
    height?: number;
    loading?: "eager" | "lazy" | "unknown";
    position?: "above_fold" | "below_fold" | "unknown";
    isDecorative?: boolean;
    isHero?: boolean;
    hasSrcset?: boolean;
    hasSizes?: boolean;
}
export interface MediaVideoInput {
    src?: string;
    embedUrl?: string;
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    uploadDate?: string;
    duration?: string;
    hasTranscript?: boolean;
    hasCaptions?: boolean;
    position?: "above_fold" | "below_fold" | "unknown";
    schema?: JsonObject;
}
export interface MediaAuditInput {
    url?: string;
    html?: string;
    page?: {
        url?: string;
        pageType?: MediaPageType;
        title?: string;
        primaryKeyword?: string;
        visibleContent?: string;
    };
    images?: MediaImageInput[];
    videos?: MediaVideoInput[];
    openGraph?: {
        ogImage?: string;
        ogImageAlt?: string;
        twitterImage?: string;
        twitterImageAlt?: string;
    };
    schema?: {
        jsonLd?: JsonObject[];
    };
    assets?: Array<{
        url: string;
        type: "image" | "video" | "font" | "script" | "stylesheet" | "unknown";
        sizeKb?: number;
        format?: string;
    }>;
    mode: MediaMode;
}
export interface MediaIssue {
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
    appliesTo: Array<"media" | "image" | "video" | "accessibility" | "performance" | "audit">;
}
export interface MediaAuditOutput {
    skill: "media-seo";
    status: "completed" | "partial" | "needs_input";
    score: number;
    summary: string;
    imageFindings: string[];
    videoFindings: string[];
    accessibilityFindings: string[];
    performanceFindings: string[];
    schemaFindings: string[];
    issues: MediaIssue[];
    missingInputs: string[];
    nextActions: string[];
}
export interface MediaRule {
    id: string;
    category: string;
    title: string;
    description: string;
    do: string[];
    dont: string[];
    priority: PriorityLabel;
    appliesTo: Array<"media" | "image" | "video" | "accessibility" | "performance" | "audit">;
    status: "active" | "planned";
}
//# sourceMappingURL=media.d.ts.map