import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";
export declare const robotsTxtRules: TechnicalRule[];
export declare function checkRobotsTxt(input: TechnicalAuditInput): {
    issues: TechnicalAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=robots-txt.d.ts.map