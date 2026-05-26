import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";
export declare const canonicalRules: TechnicalRule[];
export declare function checkCanonicalization(input: TechnicalAuditInput): {
    issues: TechnicalAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=canonicalization.d.ts.map