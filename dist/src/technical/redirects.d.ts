import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";
export declare const redirectRules: TechnicalRule[];
export declare function checkRedirects(input: TechnicalAuditInput): {
    issues: TechnicalAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=redirects.d.ts.map