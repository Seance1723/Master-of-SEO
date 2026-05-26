import type { PerformanceAuditInput, PerformanceAuditIssue, PerformanceRule } from "../types/performance.ts";
export declare const coreWebVitalsRules: PerformanceRule[];
export declare function checkCoreWebVitals(input: PerformanceAuditInput): {
    issues: PerformanceAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=core-web-vitals.d.ts.map