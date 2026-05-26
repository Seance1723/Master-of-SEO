import type { PerformanceAuditInput, PerformanceAuditIssue, PerformanceRule } from "../types/performance.ts";
export declare const javascriptPerformanceRules: PerformanceRule[];
export declare function checkJavaScriptPerformance(input: PerformanceAuditInput): {
    issues: PerformanceAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=javascript-performance.d.ts.map