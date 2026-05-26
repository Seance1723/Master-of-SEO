import type { OnPageAuditInput, OnPageAuditIssue, OnPageRule } from "../types/on-page.ts";
export declare const titleTagRules: OnPageRule[];
export declare function checkTitleTag(input: OnPageAuditInput): {
    issues: OnPageAuditIssue[];
    passedChecks: string[];
};
//# sourceMappingURL=title-tag.d.ts.map