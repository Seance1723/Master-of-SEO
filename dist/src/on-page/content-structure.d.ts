import type { OnPageAuditInput, OnPageAuditIssue, OnPageRule } from "../types/on-page.ts";
export declare const contentStructureRules: OnPageRule[];
export declare function checkContentStructure(input: OnPageAuditInput): {
    issues: OnPageAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=content-structure.d.ts.map