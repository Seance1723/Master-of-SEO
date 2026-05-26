import type { WebsiteAuditGrade, WebsiteAuditIssue, WebsiteAuditOutput } from "../types/website-audit.ts";
export declare const auditCategoryWeights: {
    readonly technicalSeo: 15;
    readonly performanceSeo: 10;
    readonly onPageSeo: 10;
    readonly contentSeo: 10;
    readonly architectureInternalLinking: 10;
    readonly schemaEntitySeo: 7;
    readonly mediaSeo: 5;
    readonly ecommerceSeo: 7;
    readonly localInternationalSeo: 6;
    readonly aiSearchDiscoverSeo: 5;
    readonly trustSecurityAccessibility: 10;
    readonly cmsFrameworkSeo: 5;
};
export declare function scoreFromIssues(issues: WebsiteAuditIssue[]): number;
export declare function calculateCategoryScore(issues: WebsiteAuditIssue[], sourceSkill: string): number;
export declare function calculateWebsiteScore(categoryScores: WebsiteAuditOutput["categoryScores"]): number;
export declare function gradeFromScore(score: number): WebsiteAuditGrade;
//# sourceMappingURL=website-score.d.ts.map