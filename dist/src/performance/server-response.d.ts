import type { PerformanceAuditInput, PerformanceAuditIssue, PerformanceRule } from "../types/performance.ts";
export declare const serverResponseRules: PerformanceRule[];
export declare function checkServerResponse(input: PerformanceAuditInput): {
    issues: PerformanceAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=server-response.d.ts.map