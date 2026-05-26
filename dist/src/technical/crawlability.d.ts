import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";
export declare const crawlabilityRules: TechnicalRule[];
export declare function checkCrawlability(input: TechnicalAuditInput): {
    issues: TechnicalAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=crawlability.d.ts.map