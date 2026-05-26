import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";
export declare const xRobotsTagRules: TechnicalRule[];
export declare function checkXRobotsTag(input: TechnicalAuditInput): {
    issues: TechnicalAuditIssue[];
    passedChecks: string[];
    hasNoindex: boolean;
};
//# sourceMappingURL=x-robots-tag.d.ts.map