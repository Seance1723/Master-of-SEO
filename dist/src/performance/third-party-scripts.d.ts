import type { PerformanceAuditInput, PerformanceAuditIssue, PerformanceRule } from "../types/performance.ts";
export declare const thirdPartyScriptRules: PerformanceRule[];
export declare function checkThirdPartyScripts(input: PerformanceAuditInput): {
    issues: PerformanceAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=third-party-scripts.d.ts.map