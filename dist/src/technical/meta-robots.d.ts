import type { TechnicalAuditInput, TechnicalAuditIssue, TechnicalRule } from "../types/technical.ts";
export declare const metaRobotsRules: TechnicalRule[];
export interface MetaRobotsResult {
    issues: TechnicalAuditIssue[];
    passedChecks: string[];
    hasNoindex: boolean;
}
export declare function checkMetaRobots(input: TechnicalAuditInput): MetaRobotsResult;
//# sourceMappingURL=meta-robots.d.ts.map