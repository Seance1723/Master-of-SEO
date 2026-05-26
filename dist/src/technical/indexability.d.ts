import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";
export declare const indexabilityRules: TechnicalRule[];
export declare function checkIndexability(input: TechnicalAuditInput, hasNoindex: boolean): {
    issues: TechnicalAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=indexability.d.ts.map