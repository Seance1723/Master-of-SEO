import type { PriorityLabel } from "./index.ts";
export type PerformanceAuditMode = "website" | "page" | "code" | "planning";
export type PerformanceFramework = "wordpress" | "react" | "nextjs" | "static" | "unknown";
export type PerformanceAuditStatus = "completed" | "partial" | "needs_input";
export type PerformanceAssetType = "image" | "script" | "stylesheet" | "font" | "video" | "third_party" | "unknown";
export interface PerformanceAsset {
    url: string;
    type: PerformanceAssetType;
    sizeKb?: number;
    loading?: "eager" | "lazy" | "async" | "defer" | "blocking" | "unknown";
    format?: string;
    position?: "above_fold" | "below_fold" | "unknown";
    width?: number;
    height?: number;
}
export interface PerformanceMetrics {
    lcp?: number;
    inp?: number;
    cls?: number;
    ttfb?: number;
    fcp?: number;
    speedIndex?: number;
    totalBlockingTime?: number;
}
export interface PerformanceAuditInput {
    url?: string;
    html?: string;
    headers?: Record<string, string | string[] | undefined>;
    assets?: PerformanceAsset[];
    metrics?: PerformanceMetrics;
    framework?: PerformanceFramework;
    mode: PerformanceAuditMode;
}
export interface PerformanceAuditIssue {
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
    appliesTo: Array<"website" | "page" | "performance" | "audit">;
}
export interface PerformanceAuditOutput {
    skill: "performance-seo";
    status: PerformanceAuditStatus;
    score: number;
    summary: string;
    metrics: {
        lcp: number | null;
        inp: number | null;
        cls: number | null;
        ttfb: number | null;
    };
    issues: PerformanceAuditIssue[];
    passedChecks: string[];
    missingInputs: string[];
    nextActions: string[];
}
export interface PerformanceRule {
    id: string;
    category: string;
    title: string;
    description: string;
    do: string[];
    dont: string[];
    priority: PriorityLabel;
    appliesTo: Array<"website" | "page" | "performance" | "audit">;
    status: "active" | "planned";
}
//# sourceMappingURL=performance.d.ts.map