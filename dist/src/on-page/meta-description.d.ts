import type { OnPageAuditInput, OnPageAuditIssue, OnPageRule } from "../types/on-page.ts";
export declare const metaDescriptionRules: OnPageRule[];
export declare function checkMetaDescription(input: OnPageAuditInput): {
    issues: OnPageAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=meta-description.d.ts.map