import type { PriorityLabel } from "./index.ts";
export type TechnicalAuditMode = "website" | "page" | "code" | "planning";
export type TechnicalFramework = "wordpress" | "react" | "nextjs" | "static" | "unknown";
export type TechnicalAuditStatus = "completed" | "partial" | "needs_input";
export interface TechnicalAuditPage {
    url?: string;
    html?: string;
    statusCode?: number;
    canonicalUrl?: string;
    importance?: "high" | "medium" | "low";
    pageType?: string;
    noindex?: boolean;
    redirected?: boolean;
}
export interface TechnicalAuditInput {
    url?: string;
    html?: string;
    robotsTxt?: string;
    sitemapXml?: string;
    headers?: Record<string, string | string[] | undefined>;
    statusCode?: number;
    canonicalUrl?: string;
    links?: string[];
    pages?: TechnicalAuditPage[];
    framework?: TechnicalFramework;
    mode: TechnicalAuditMode;
}
export interface TechnicalAuditIssue {
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
    appliesTo: Array<"website" | "page" | "content" | "technical" | "audit">;
}
export interface TechnicalAuditOutput {
    skill: "technical-seo";
    status: TechnicalAuditStatus;
    score: number;
    summary: string;
    issues: TechnicalAuditIssue[];
    passedChecks: string[];
    missingInputs: string[];
    nextActions: string[];
}
export interface TechnicalRule {
    id: string;
    category: string;
    title: string;
    description: string;
    do: string[];
    dont: string[];
    priority: PriorityLabel;
    appliesTo: Array<"website" | "page" | "content" | "technical" | "audit">;
    status: "active" | "planned";
}
//# sourceMappingURL=technical.d.ts.map