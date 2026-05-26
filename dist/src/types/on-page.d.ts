import type { PriorityLabel } from "./index.ts";
export type OnPageAuditMode = "website" | "page" | "code" | "planning";
export type OnPageType = "homepage" | "service" | "product" | "category" | "blog" | "landing" | "pricing" | "contact" | "about" | "documentation" | "unknown";
export interface OnPageHeading {
    level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    text: string;
}
export interface OnPageImage {
    src: string;
    alt?: string;
    position?: "above_fold" | "below_fold" | "unknown";
}
export interface OnPageLink {
    href: string;
    text?: string;
    type?: "internal" | "external" | "unknown";
}
export interface OnPageCta {
    text: string;
    href?: string;
    position?: "above_fold" | "below_fold" | "unknown";
}
export interface OnPageAuditInput {
    url?: string;
    html?: string;
    title?: string;
    metaDescription?: string;
    h1?: string;
    headings?: OnPageHeading[];
    bodyText?: string;
    images?: OnPageImage[];
    links?: OnPageLink[];
    ctas?: OnPageCta[];
    pageType?: OnPageType;
    primaryKeyword?: string;
    secondaryKeywords?: string[];
    mode: OnPageAuditMode;
}
export interface OnPageAuditIssue {
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
    appliesTo: Array<"website" | "page" | "content" | "on_page" | "audit">;
}
export interface OnPageAuditOutput {
    skill: "on-page-seo";
    status: "completed" | "partial" | "needs_input";
    score: number;
    summary: string;
    issues: OnPageAuditIssue[];
    passedChecks: string[];
    missingInputs: string[];
    nextActions: string[];
}
export interface OnPageRule {
    id: string;
    category: string;
    title: string;
    description: string;
    do: string[];
    dont: string[];
    priority: PriorityLabel;
    appliesTo: Array<"website" | "page" | "content" | "on_page" | "audit">;
    status: "active" | "planned";
}
//# sourceMappingURL=on-page.d.ts.map