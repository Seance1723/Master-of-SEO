import type { PerformanceAuditInput, PerformanceAuditIssue, PerformanceRule } from "../types/performance.ts";
export declare const cssPerformanceRules: PerformanceRule[];
export declare function checkCssPerformance(input: PerformanceAuditInput): {
    issues: PerformanceAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=css-performance.d.ts.map