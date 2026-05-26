import type { PerformanceAuditInput, PerformanceAuditIssue, PerformanceRule } from "../types/performance.ts";
export declare const assetOptimizationRules: PerformanceRule[];
export declare function checkAssetOptimization(input: PerformanceAuditInput): {
    issues: PerformanceAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=asset-optimization.d.ts.map