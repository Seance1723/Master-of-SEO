import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";
export declare const sitemapRules: TechnicalRule[];
export declare function checkSitemap(input: TechnicalAuditInput): {
    issues: TechnicalAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=sitemap.d.ts.map